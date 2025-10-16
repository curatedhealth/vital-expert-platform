// Prevent pre-rendering for admin pages
export const dynamic = 'force-dynamic';

import { 
  FileText, 
  Users, 
  Key, 
  Settings,
  Activity,
  Shield,
  Building2,
  Cog,
  Database,
  DollarSign,
  Lock,
  Bell,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VitalPageLayout, VitalCard, VitalStatsCard } from '@/components/layout/vital-page-layout';

export default async function AdminPage() {

  const adminFeatures = [
    {
      title: 'Audit Logs',
      description: 'View system audit logs and security events',
      href: '/admin/audit-logs',
      icon: FileText,
      color: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      href: '/admin/users',
      icon: Users,
      color: 'bg-success/10',
      iconColor: 'text-success'
    },
    {
      title: 'API Keys',
      description: 'Manage API keys and authentication tokens',
      href: '/admin/api-keys',
      icon: Key,
      color: 'bg-info/10',
      iconColor: 'text-info'
    },
    {
      title: 'Tenant Management',
      description: 'Manage organizations, departments, and quotas',
      href: '/admin/tenants',
      icon: Building2,
      color: 'bg-secondary/10',
      iconColor: 'text-secondary'
    },
    {
      title: 'Health & Reliability',
      description: 'Monitor system health, SLOs, and incidents',
      href: '/admin/health',
      icon: Activity,
      color: 'bg-destructive/10',
      iconColor: 'text-destructive'
    },
    {
      title: 'Compliance & Reports',
      description: 'HIPAA, SOC2, FDA compliance and incident playbooks',
      href: '/admin/compliance',
      icon: Shield,
      color: 'bg-warning/10',
      iconColor: 'text-warning'
    },
    {
      title: 'LLM Governance',
      description: 'Prompt policies, approval workflows, and change management',
      href: '/admin/governance',
      icon: FileText,
      color: 'bg-info/10',
      iconColor: 'text-info'
    },
    {
      title: 'Identity & Access',
      description: 'SSO, MFA, access reviews, and session security',
      href: '/admin/identity',
      icon: Shield,
      color: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      title: 'Immutable Audit',
      description: 'Hash-chained audit logs, WORM storage, and SIEM export',
      href: '/admin/audit-immutable',
      icon: FileText,
      color: 'bg-muted/50',
      iconColor: 'text-muted-foreground'
    },
    {
      title: 'System Settings',
      description: 'Feature flags, system config, and maintenance mode',
      href: '/admin/settings',
      icon: Cog,
      color: 'bg-muted/50',
      iconColor: 'text-muted-foreground'
    },
    {
      title: 'Backup & Recovery',
      description: 'Database backups, restore operations, and scheduling',
      href: '/admin/backup',
      icon: Database,
      color: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      title: 'Cost Management',
      description: 'Monitor costs, budgets, anomalies, and usage forecasting',
      href: '/admin/costs',
      icon: DollarSign,
      color: 'bg-success/10',
      iconColor: 'text-success'
    },
    {
      title: 'Security Controls',
      description: 'Rate limiting, IP management, abuse detection, and security incidents',
      href: '/admin/security',
      icon: Lock,
      color: 'bg-destructive/10',
      iconColor: 'text-destructive'
    },
    {
      title: 'Alerts & Monitoring',
      description: 'Alert rules, notification channels, and alert history',
      href: '/admin/alerts',
      icon: Bell,
      color: 'bg-warning/10',
      iconColor: 'text-warning'
    },
    {
      title: 'LLM Management',
      description: 'Configure LLM providers and models',
      href: '/dashboard/llm-management?view=admin',
      icon: Settings,
      color: 'bg-info/10',
      iconColor: 'text-info'
    }
  ];

  return (
    <VitalPageLayout
      title="Admin Dashboard"
      description="Comprehensive system management and security controls for healthcare platforms"
      badge="Administrator"
    >
      <div className="space-y-8">
        {/* Admin Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-destructive to-warning p-8 text-white">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Shield className="h-3 w-3 mr-1" />
                System Administration
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              VITAL Path Administration
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Comprehensive system management and security controls for healthcare platforms
            </p>
            <div className="flex gap-4">
              <Button size="lg" variant="secondary" className="bg-white text-destructive hover:bg-white/90">
                System Health
                <Activity className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Security Overview
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <VitalStatsCard
            title="System Status"
            value="Operational"
            description="All systems running normally"
            icon={<Activity className="h-8 w-8" />}
            trend={{ value: 0, label: "uptime", positive: true }}
          />
          <VitalStatsCard
            title="Active Users"
            value="1,234"
            description="Platform users online"
            icon={<Users className="h-8 w-8" />}
            trend={{ value: 12, label: "this month", positive: true }}
          />
          <VitalStatsCard
            title="Security Events"
            value="0"
            description="No security incidents"
            icon={<Shield className="h-8 w-8" />}
            trend={{ value: 0, label: "this week", positive: true }}
          />
          <VitalStatsCard
            title="Compliance Score"
            value="A+"
            description="HIPAA & FDA ready"
            icon={<Lock className="h-8 w-8" />}
            trend={{ value: 0, label: "maintained", positive: true }}
          />
        </div>

        {/* Admin Features Grid */}
        <VitalCard
          title="Administrative Tools"
          description="Comprehensive system management and monitoring capabilities"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminFeatures.map((feature) => (
              <Card key={feature.title} className="hover:shadow-xl transition-all hover:-translate-y-1 group">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${feature.color} group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="mt-2">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={feature.href}>
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      Access {feature.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </VitalCard>
      </div>
    </VitalPageLayout>
  );
}

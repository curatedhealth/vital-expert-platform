'use client';

import {
  FileText,
  Settings,
  Brain,
  Target,
  TestTube,
  BookOpen,
  BarChart3,
  Search,
  Package2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Plus,
  Grid,
  List,
  Server,
  Database,
  Activity,
  DollarSign,
  Shield,
  Zap,
  Users,
  Key,
  AlertTriangle,
  TrendingUp,
  Monitor,
  CloudCog,
  CheckCircle,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo, Suspense } from 'react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Separator } from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<unknown>;
  badge?: string;
  disabled?: boolean;
  avatar?: string;
}

// Knowledge Management specific navigation
const knowledgeNavItems: NavItem[] = [
  {
    title: 'Knowledge Analytics',
    href: '/knowledge',
    icon: BarChart3,
  },
  {
    title: 'Upload Documents',
    href: '/knowledge?tab=upload',
    icon: Upload,
  },
  {
    title: 'Manage Documents',
    href: '/knowledge?tab=manage',
    icon: FileText,
  },
  {
    title: 'Search & Browse',
    href: '/knowledge?tab=search',
    icon: Search,
  },
];

const knowledgeRAGCategories: NavItem[] = [
  {
    title: 'Clinical',
    href: '/knowledge?category=clinical',
    icon: TestTube,
  },
  {
    title: 'Regulatory',
    href: '/knowledge?category=regulatory',
    icon: FileText,
  },
  {
    title: 'Research',
    href: '/knowledge?category=research',
    icon: Brain,
  },
  {
    title: 'Reimbursement',
    href: '/knowledge?category=reimbursement',
    icon: Target,
  },
  {
    title: 'Technology',
    href: '/knowledge?category=technology',
    icon: Settings,
  },
];

// Knowledge agents will be loaded dynamically from the database
const knowledgeAgents: NavItem[] = [];

// LLM Management specific navigation
const llmManagementNavItems: NavItem[] = [
  {
    title: 'Agent Analytics',
    href: '/admin?view=agent-analytics',
    icon: BarChart3,
  },
  {
    title: 'Provider Dashboard',
    href: '/dashboard/llm-management?view=providers',
    icon: Server,
  },
  {
    title: 'Usage Analytics',
    href: '/dashboard/llm-management?view=analytics',
    icon: BarChart3,
  },
  {
    title: 'Cost Monitoring',
    href: '/dashboard/llm-management?view=costs',
    icon: DollarSign,
  },
  {
    title: 'Health & Status',
    href: '/dashboard/llm-management?view=health',
    icon: Activity,
  },
];

const llmProviderCategories: NavItem[] = [
  {
    title: 'OpenAI',
    href: '/dashboard/llm-management?provider=openai',
    icon: Brain,
  },
  {
    title: 'Anthropic',
    href: '/dashboard/llm-management?provider=anthropic',
    icon: Zap,
  },
  {
    title: 'Google',
    href: '/dashboard/llm-management?provider=google',
    icon: Search,
  },
  {
    title: 'Azure',
    href: '/dashboard/llm-management?provider=azure',
    icon: CloudCog,
  },
  {
    title: 'AWS Bedrock',
    href: '/dashboard/llm-management?provider=aws_bedrock',
    icon: Server,
  },
];

const medicalModelCategories: NavItem[] = [
  {
    title: 'Meditron Setup',
    href: '/dashboard/meditron-setup',
    icon: TestTube,
  },
  {
    title: 'Meditron Models',
    href: '/dashboard/llm-management?provider=meditron',
    icon: Brain,
  },
  {
    title: 'ClinicalBERT',
    href: '/dashboard/llm-management?provider=clinicalbert',
    icon: FileText,
  },
  {
    title: 'BioBERT',
    href: '/dashboard/llm-management?provider=biobert',
    icon: BookOpen,
  },
  {
    title: 'Med-PaLM',
    href: '/dashboard/llm-management?provider=medpalm',
    icon: Brain,
  },
  {
    title: 'SciBERT',
    href: '/dashboard/llm-management?provider=scibert',
    icon: Settings,
  },
];

const llmDatabaseViews: NavItem[] = [
  {
    title: 'Provider Tables',
    href: '/dashboard/llm-management?db=providers',
    icon: Database,
  },
  {
    title: 'Usage Logs',
    href: '/dashboard/llm-management?db=usage',
    icon: FileText,
  },
  {
    title: 'Health Checks',
    href: '/dashboard/llm-management?db=health',
    icon: Monitor,
  },
  {
    title: 'User Sessions',
    href: '/dashboard/llm-management?db=sessions',
    icon: Users,
  },
  {
    title: 'API Keys',
    href: '/dashboard/llm-management?db=keys',
    icon: Key,
  },
];

const llmAdminTools: NavItem[] = [
  {
    title: 'Security Audit',
    href: '/dashboard/llm-management?admin=security',
    icon: Shield,
  },
  {
    title: 'Compliance Reports',
    href: '/dashboard/llm-management?admin=compliance',
    icon: FileText,
  },
  {
    title: 'System Alerts',
    href: '/dashboard/llm-management?admin=alerts',
    icon: AlertTriangle,
  },
  {
    title: 'Performance Tuning',
    href: '/dashboard/llm-management?admin=performance',
    icon: TrendingUp,
  },
];

interface DashboardSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentView?: 'knowledge' | 'agents' | 'projects' | 'llm' | 'prompts' | 'capabilities' | 'default';
  // Agent-specific props
  onCreateAgent?: () => void;
  onUploadAgent?: () => void;
  onSearchChange?: (query: string) => void;
  onFilterChange?: (filters: AgentFilters) => void;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  searchQuery?: string;
  filters?: AgentFilters;
  viewMode?: 'grid' | 'list';
  availableDomains?: string[];
  availableCapabilities?: string[];
  businessFunctions?: Array<{ id: string; name: string }>;
  departments?: Array<{ id: string; name: string; business_function_id?: string }>;
  organizationalRoles?: Array<{ id: string; name: string; department_id?: string; business_function_id?: string }>;
}

interface AgentFilters {
  selectedTier: string;
  selectedStatus: string;
  selectedBusinessFunction: string;
  selectedDepartment: string;
  selectedRole: string;
}

export function DashboardSidebar({
  className,
  isCollapsed = false,
  onToggleCollapse,
  currentView = 'default',
  onCreateAgent,
  onUploadAgent,
  onSearchChange,
  onFilterChange,
  onViewModeChange,
  searchQuery = '',
  filters,
  viewMode = 'grid',
  availableDomains = [],
  availableCapabilities = [],
  businessFunctions = [],
  departments = [],
  organizationalRoles = [],
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Deduplicate business functions, departments, and roles by name
  const uniqueBusinessFunctions = useMemo(() => {
    const seen = new Set<string>();
    return businessFunctions.filter(func => {
      if (seen.has(func.name)) {
        return false;
      }
      seen.add(func.name);
      return true;
    });
  }, [businessFunctions]);

  const uniqueDepartments = useMemo(() => {
    const seen = new Set<string>();
    return departments.filter(dept => {
      const key = `${dept.name}_${dept.business_function_id || 'none'}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [departments]);

  const uniqueRoles = useMemo(() => {
    const seen = new Set<string>();
    return organizationalRoles.filter(role => {
      const key = `${role.name}_${role.department_id || 'none'}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [organizationalRoles]);

  // Cascading filter logic for agents view
  // Get selected function ID from name
  const selectedFunctionId = useMemo(() => {
    if (!filters?.selectedBusinessFunction || filters.selectedBusinessFunction === 'all') return null;
    return uniqueBusinessFunctions.find((f: any) => f.name === filters.selectedBusinessFunction)?.id;
  }, [filters?.selectedBusinessFunction, uniqueBusinessFunctions]);

  // Get selected department ID from name
  const selectedDepartmentId = useMemo(() => {
    if (!filters?.selectedDepartment || filters.selectedDepartment === 'all') return null;
    return uniqueDepartments.find((d: any) => d.name === filters.selectedDepartment)?.id;
  }, [filters?.selectedDepartment, uniqueDepartments]);

  // Filter departments based on selected function
  const filteredDepartments = useMemo(() => {
    if (!selectedFunctionId) return uniqueDepartments;
    return uniqueDepartments.filter((d: any) => d.business_function_id === selectedFunctionId);
  }, [selectedFunctionId, uniqueDepartments]);

  // Filter roles based on selected function and department
  const filteredRoles = useMemo(() => {
    if (selectedDepartmentId) {
      // Filter by department
      return uniqueRoles.filter((r: any) => r.department_id === selectedDepartmentId);
    } else if (selectedFunctionId) {
      // Filter by function
      return uniqueRoles.filter((r: any) => r.business_function_id === selectedFunctionId);
    }
    return uniqueRoles;
  }, [selectedFunctionId, selectedDepartmentId, uniqueRoles]);

  const renderKnowledgeNavigation = () => (
    <>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "Knowledge Management"}
          </h2>
          <div className="space-y-1">
            {knowledgeNavItems.map((item) => {
              const basePath = item.href.split('?')[0];
              const query = item.href.split('?')[1];
              const isActive = pathname === basePath &&
                (query ? searchParams.toString().includes(query) : searchParams.get('tab') === null);

              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full',
                    isCollapsed ? 'justify-center px-2' : 'justify-start',
                    isActive && 'bg-muted',
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && item.title}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="px-3">
        <Separator />
      </div>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "RAG Categories"}
          </h2>
          <div className="space-y-1">
            {knowledgeRAGCategories.map((item) => {
              const categoryParam = item.href.split('category=')[1];
              const isActive = searchParams.get('category') === categoryParam;

              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full',
                    isCollapsed ? 'justify-center px-2' : 'justify-start',
                    isActive && 'bg-muted',
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && item.title}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="px-3">
        <Separator />
      </div>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "AI Agents"}
          </h2>
          <div className="space-y-1">
            {knowledgeAgents.map((item) => {
              const agentParam = item.href.split('agent=')[1];
              const isActive = searchParams.get('agent') === agentParam;

              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full',
                    isCollapsed ? 'justify-center px-2' : 'justify-start',
                    isActive && 'bg-muted',
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    {item.avatar ? (
                      <div className="relative w-4 h-4 flex-shrink-0">
                        {item.avatar.startsWith('/') || item.avatar.startsWith('http') ? (
                          <Image
                            src={item.avatar}
                            alt={item.title}
                            width={16}
                            height={16}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                            {item.avatar}
                          </div>
                        )}
                      </div>
                    ) : (
                      item.icon && <item.icon className="h-4 w-4" />
                    )}
                    {!isCollapsed && item.title}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );

  const renderLLMNavigation = () => (
    <>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "LLM Management"}
          </h2>
          <div className="space-y-1">
            {llmManagementNavItems.map((item) => {
              const viewParam = item.href.split('view=')[1];
              const isActive = searchParams.get('view') === viewParam ||
                (item.href.includes('view=providers') && !searchParams.get('view'));

              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full',
                    isCollapsed ? 'justify-center px-2' : 'justify-start',
                    isActive && 'bg-muted',
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && item.title}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="px-3">
        <Separator />
      </div>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "General Providers"}
          </h2>
          <div className="space-y-1">
            {llmProviderCategories.map((item) => {
              const providerParam = item.href.split('provider=')[1];
              const isActive = searchParams.get('provider') === providerParam;

              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full',
                    isCollapsed ? 'justify-center px-2' : 'justify-start',
                    isActive && 'bg-muted',
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && item.title}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="px-3">
        <Separator />
      </div>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "Medical AI Models"}
          </h2>
          <div className="space-y-1">
            {medicalModelCategories.map((item) => {
              const providerParam = item.href.split('provider=')[1];
              const isActive = searchParams.get('provider') === providerParam;

              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full',
                    isCollapsed ? 'justify-center px-2' : 'justify-start',
                    isActive && 'bg-muted',
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && item.title}
                    <Badge variant="outline" className="ml-auto text-xs bg-green-50 text-green-700">
                      Med
                    </Badge>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="px-3">
        <Separator />
      </div>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "Database Views"}
          </h2>
          <div className="space-y-1">
            {llmDatabaseViews.map((item) => {
              const dbParam = item.href.split('db=')[1];
              const isActive = searchParams.get('db') === dbParam;

              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full',
                    isCollapsed ? 'justify-center px-2' : 'justify-start',
                    isActive && 'bg-muted',
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && item.title}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="px-3">
        <Separator />
      </div>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "Admin Tools"}
          </h2>
          <div className="space-y-1">
            {llmAdminTools.map((item) => {
              const adminParam = item.href.split('admin=')[1];
              const isActive = searchParams.get('admin') === adminParam;

              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full',
                    isCollapsed ? 'justify-center px-2' : 'justify-start',
                    isActive && 'bg-muted',
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && item.title}
                    {item.title === 'System Alerts' && (
                      <Badge variant="destructive" className="ml-auto text-xs">
                        2
                      </Badge>
                    )}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );

  const renderAgentsNavigation = () => (
    <>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "Actions"}
          </h2>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={cn(
                'w-full',
                isCollapsed ? 'justify-center px-2' : 'justify-start',
              )}
              onClick={onCreateAgent}
            >
              <Plus className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Create Agent</span>}
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'w-full',
                isCollapsed ? 'justify-center px-2' : 'justify-start',
              )}
              onClick={onUploadAgent}
            >
              <Upload className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Upload from File</span>}
            </Button>
          </div>
        </div>
      </div>
      <div className="px-3">
        <Separator />
      </div>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "Search"}
          </h2>
          {!isCollapsed && (
            <div className="px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-md bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="px-3">
        <Separator />
      </div>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "Filters"}
          </h2>
          {!isCollapsed && filters && (
            <div className="px-4 space-y-3">
              <div>
                <label htmlFor="tier-select" className="text-xs font-medium text-muted-foreground mb-1 block">
                  Tier
                </label>
                <select
                  id="tier-select"
                  value={filters.selectedTier}
                  onChange={(e) => onFilterChange?.({
                    ...filters,
                    selectedTier: e.target.value
                  })}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="all">All Tiers</option>
                  <option value="core">Core</option>
                  <option value="1">Tier 1</option>
                  <option value="2">Tier 2</option>
                  <option value="3">Tier 3</option>
                </select>
              </div>
              <div>
                <label htmlFor="status-select" className="text-xs font-medium text-muted-foreground mb-1 block">
                  Status
                </label>
                <select
                  id="status-select"
                  value={filters.selectedStatus}
                  onChange={(e) => onFilterChange?.({
                    ...filters,
                    selectedStatus: e.target.value
                  })}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="development">Development</option>
                  <option value="testing">Testing</option>
                  <option value="inactive">Inactive</option>
                  <option value="deprecated">Deprecated</option>
                </select>
              </div>
              <div>
                <label htmlFor="business-function-select" className="text-xs font-medium text-muted-foreground mb-1 block">
                  Business Function
                </label>
                <select
                  id="business-function-select"
                  value={filters.selectedBusinessFunction}
                  onChange={(e) => onFilterChange?.({
                    ...filters,
                    selectedBusinessFunction: e.target.value,
                    // Reset dependent filters when function changes
                    selectedDepartment: 'all',
                    selectedRole: 'all'
                  })}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="all">All Functions</option>
                  {uniqueBusinessFunctions.map(func => (
                    <option key={func.id} value={func.name}>
                      {func.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="department-select" className="text-xs font-medium text-muted-foreground mb-1 block">
                  Department
                </label>
                <select
                  id="department-select"
                  value={filters.selectedDepartment}
                  onChange={(e) => onFilterChange?.({
                    ...filters,
                    selectedDepartment: e.target.value,
                    // Reset role when department changes
                    selectedRole: 'all'
                  })}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="all">All Departments</option>
                  {filteredDepartments.map(dept => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="role-select" className="text-xs font-medium text-muted-foreground mb-1 block">
                  Role
                </label>
                <select
                  id="role-select"
                  value={filters.selectedRole}
                  onChange={(e) => onFilterChange?.({
                    ...filters,
                    selectedRole: e.target.value
                  })}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="all">All Roles</option>
                  {filteredRoles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="px-3">
        <Separator />
      </div>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "View"}
          </h2>
          <div className="px-4">
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onViewModeChange?.('grid')}
              >
                <Grid className="h-4 w-4" />
                {!isCollapsed && <span className="ml-1">Grid</span>}
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onViewModeChange?.('list')}
              >
                <List className="h-4 w-4" />
                {!isCollapsed && <span className="ml-1">List</span>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderPromptsNavigation = () => (
    <>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "Prompt Categories"}
          </h2>
          <div className="space-y-1">
            {[
              { name: 'Featured', icon: Star, href: '/dashboard/prompts?featured=true' },
              { name: 'Regulatory', icon: FileText, href: '/dashboard/prompts?category=regulatory' },
              { name: 'Clinical', icon: TestTube, href: '/dashboard/prompts?category=clinical' },
              { name: 'Compliance', icon: Shield, href: '/dashboard/prompts?category=compliance' },
              { name: 'Quality', icon: Target, href: '/dashboard/prompts?category=quality' },
              { name: 'Documentation', icon: BookOpen, href: '/dashboard/prompts?category=documentation' },
            ].map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  'w-full',
                  isCollapsed ? 'justify-center px-2' : 'justify-start',
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3">
        <Separator />
      </div>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "Quick Actions"}
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className={cn('w-full', isCollapsed ? 'justify-center px-2' : 'justify-start')}>
              <Plus className="h-4 w-4" />
              {!isCollapsed && "Create Prompt"}
            </Button>
            <Button variant="ghost" className={cn('w-full', isCollapsed ? 'justify-center px-2' : 'justify-start')}>
              <Upload className="h-4 w-4" />
              {!isCollapsed && "Import Prompts"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  const renderCapabilitiesNavigation = () => (
    <>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "Capability Categories"}
          </h2>
          <div className="space-y-1">
            {[
              { name: 'Active', icon: CheckCircle, href: '/dashboard/capabilities?status=active' },
              { name: 'Regulatory', icon: FileText, href: '/dashboard/capabilities?category=regulatory' },
              { name: 'Clinical', icon: TestTube, href: '/dashboard/capabilities?category=clinical' },
              { name: 'Analysis', icon: BarChart3, href: '/dashboard/capabilities?category=analysis' },
              { name: 'Quality', icon: Target, href: '/dashboard/capabilities?category=quality' },
              { name: 'Premium', icon: Star, href: '/dashboard/capabilities?premium=true' },
            ].map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  'w-full',
                  isCollapsed ? 'justify-center px-2' : 'justify-start',
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3">
        <Separator />
      </div>
      <div className="px-3">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {!isCollapsed && "Management"}
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className={cn('w-full', isCollapsed ? 'justify-center px-2' : 'justify-start')}>
              <Plus className="h-4 w-4" />
              {!isCollapsed && "Create Capability"}
            </Button>
            <Button variant="ghost" className={cn('w-full', isCollapsed ? 'justify-center px-2' : 'justify-start')}>
              <Settings className="h-4 w-4" />
              {!isCollapsed && "Configure"}
            </Button>
            <Button variant="ghost" className={cn('w-full', isCollapsed ? 'justify-center px-2' : 'justify-start')}>
              <Activity className="h-4 w-4" />
              {!isCollapsed && "Monitor Usage"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  const renderDefaultNavigation = () => (
    <div className="px-3">
      <div className="space-y-1">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          {!isCollapsed && "No specific navigation"}
        </h2>
        <p className="px-4 text-sm text-muted-foreground">
          {!isCollapsed && "Context-specific navigation will appear here"}
        </p>
      </div>
    </div>
  );

  return (
    <div className={cn('pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className={cn("px-3 py-2", isCollapsed && "px-1")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package2 className="h-6 w-6" />
              {!isCollapsed && (
                <h2 className="text-lg font-semibold tracking-tight">
                  Context Menu
                </h2>
              )}
            </div>
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleCollapse}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        {currentView === 'knowledge' && renderKnowledgeNavigation()}
        {currentView === 'agents' && renderAgentsNavigation()}
        {currentView === 'llm' && renderLLMNavigation()}
        {currentView === 'prompts' && renderPromptsNavigation()}
        {currentView === 'capabilities' && renderCapabilitiesNavigation()}
        {currentView === 'default' && renderDefaultNavigation()}
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary
export function DashboardSidebarWithSuspense(props: DashboardSidebarProps) {
  return (
    <Suspense fallback={<div className="w-64 h-screen bg-background border-r animate-pulse" />}>
      <DashboardSidebar {...props} />
    </Suspense>
  );
}
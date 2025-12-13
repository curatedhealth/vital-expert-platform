"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  BarChart,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Cpu,
  Database,
  FlaskConical,
  FolderOpen,
  Heart,
  Kanban,
  Laptop,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  List,
  Lock,
  Pill,
  SearchIcon,
  Shield,
  Stethoscope,
  Table,
  Upload,
  Zap,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"

// Knowledge domain categories with their domains
const KNOWLEDGE_DOMAIN_CATEGORIES = {
  regulatory: {
    label: 'Regulatory',
    icon: Shield,
    color: 'text-blue-500',
    domains: [
      { value: 'regulatory', label: 'Regulatory Affairs' },
      { value: 'fda-guidance', label: 'FDA Guidance' },
      { value: 'ema-guidance', label: 'EMA Guidance' },
      { value: 'ich-guidelines', label: 'ICH Guidelines' },
      { value: 'compliance', label: 'Compliance' },
    ]
  },
  clinical: {
    label: 'Clinical',
    icon: Stethoscope,
    color: 'text-green-500',
    domains: [
      { value: 'clinical-trials', label: 'Clinical Trials' },
      { value: 'protocols', label: 'Protocols' },
      { value: 'clinical-data', label: 'Clinical Data' },
      { value: 'biostatistics', label: 'Biostatistics' },
      { value: 'endpoints', label: 'Clinical Endpoints' },
    ]
  },
  safety: {
    label: 'Safety',
    icon: AlertTriangle,
    color: 'text-red-500',
    domains: [
      { value: 'pharmacovigilance', label: 'Pharmacovigilance' },
      { value: 'adverse-events', label: 'Adverse Events' },
      { value: 'safety-reporting', label: 'Safety Reporting' },
      { value: 'risk-management', label: 'Risk Management' },
    ]
  },
  scientific: {
    label: 'Scientific',
    icon: FlaskConical,
    color: 'text-purple-500',
    domains: [
      { value: 'drug-development', label: 'Drug Development' },
      { value: 'pharmacology', label: 'Pharmacology' },
      { value: 'toxicology', label: 'Toxicology' },
      { value: 'biomarkers', label: 'Biomarkers' },
      { value: 'genomics', label: 'Genomics' },
    ]
  },
  commercial: {
    label: 'Commercial',
    icon: BarChart,
    color: 'text-orange-500',
    domains: [
      { value: 'market-access', label: 'Market Access' },
      { value: 'health-economics', label: 'Health Economics' },
      { value: 'pricing-reimbursement', label: 'Pricing & Reimbursement' },
      { value: 'competitive-intelligence', label: 'Competitive Intelligence' },
    ]
  },
  quality: {
    label: 'Quality',
    icon: CheckCircle2,
    color: 'text-teal-500',
    domains: [
      { value: 'quality-assurance', label: 'Quality Assurance' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'gmp', label: 'GMP' },
      { value: 'labeling', label: 'Labeling' },
    ]
  },
  devices: {
    label: 'Medical Devices',
    icon: Cpu,
    color: 'text-cyan-500',
    domains: [
      { value: 'medical-devices', label: 'Medical Devices' },
      { value: '510k', label: '510(k)' },
      { value: 'pma', label: 'PMA' },
      { value: 'companion-diagnostics', label: 'Companion Diagnostics' },
    ]
  },
  digital: {
    label: 'Digital Health',
    icon: Laptop,
    color: 'text-indigo-500',
    domains: [
      { value: 'digital-therapeutics', label: 'Digital Therapeutics' },
      { value: 'real-world-evidence', label: 'Real-World Evidence' },
      { value: 'ai-ml', label: 'AI/ML' },
    ]
  },
} as const

// Therapeutic areas for filtering
const THERAPEUTIC_AREAS = [
  { value: 'oncology', label: 'Oncology' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'immunology', label: 'Immunology' },
  { value: 'infectious-disease', label: 'Infectious Disease' },
  { value: 'endocrinology', label: 'Endocrinology' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'gastroenterology', label: 'Gastroenterology' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'rare-diseases', label: 'Rare Diseases' },
] as const

// Lifecycle status options
const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'review', label: 'Under Review', color: 'bg-yellow-500' },
  { value: 'deprecated', label: 'Deprecated', color: 'bg-orange-500' },
  { value: 'archived', label: 'Archived', color: 'bg-red-500' },
] as const

// Access level options
const ACCESS_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'organization', label: 'Organization' },
  { value: 'private', label: 'Private' },
  { value: 'confidential', label: 'Confidential' },
] as const

/**
 * Knowledge sidebar content.
 * Displays RAG knowledge base management with comprehensive filtering.
 * [PROD] - Production ready
 */
export function SidebarKnowledgeContent() {
  const searchParams = useSearchParams()

  // Get current filters from URL
  const currentView = searchParams.get("view") || "overview"
  const currentDomain = searchParams.get("domain") || ""
  const currentCategory = searchParams.get("category") || ""
  const currentStatus = searchParams.get("status") || ""
  const currentAccess = searchParams.get("access") || ""
  const currentTherapeutic = searchParams.get("therapeutic") || ""

  // Build URL with params (preserves existing params)
  const buildUrl = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    const queryString = newParams.toString()
    return `/knowledge${queryString ? '?' + queryString : ''}`
  }

  // Check if item is active
  const isViewActive = (view: string) => currentView === view
  const isDomainActive = (domain: string) => currentDomain === domain
  const isCategoryActive = (category: string) => currentCategory === category
  const isStatusActive = (status: string) => currentStatus === status
  const isAccessActive = (access: string) => currentAccess === access
  const isTherapeuticActive = (therapeutic: string) => currentTherapeutic === therapeutic

  return (
    <>
      {/* Title */}
      <div className="px-2 py-3 mb-2">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold">Knowledge Bases</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-7">RAG knowledge management</p>
      </div>

      {/* Views */}
      <SidebarCollapsibleSection title="Views" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isViewActive("overview")}>
              <Link href={buildUrl({ view: "overview" })}>
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isViewActive("grid")}>
              <Link href={buildUrl({ view: "grid" })}>
                <LayoutGrid className="h-4 w-4" />
                <span>Grid</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isViewActive("list")}>
              <Link href={buildUrl({ view: "list" })}>
                <List className="h-4 w-4" />
                <span>List</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isViewActive("table")}>
              <Link href={buildUrl({ view: "table" })}>
                <Table className="h-4 w-4" />
                <span>Table</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={isViewActive("kanban")}>
              <Link href={buildUrl({ view: "kanban" })}>
                <Kanban className="h-4 w-4" />
                <span>Kanban</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Browse */}
      <SidebarCollapsibleSection title="Browse" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={!currentDomain && !currentCategory && !currentStatus}>
              <Link href={buildUrl({ domain: null, category: null, status: null, access: null, therapeutic: null })}>
                <BookOpen className="h-4 w-4" />
                <span>All Knowledge Bases</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Filter by Domain Category */}
      <SidebarCollapsibleSection title="Domain Categories" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={!currentCategory}>
              <Link href={buildUrl({ category: null })}>
                <CheckCircle2 className="h-4 w-4 text-gray-500" />
                <span>All Categories</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {Object.entries(KNOWLEDGE_DOMAIN_CATEGORIES).map(([key, cat]) => {
            const Icon = cat.icon
            return (
              <SidebarMenuItem key={key}>
                <SidebarMenuButton asChild data-active={isCategoryActive(key)}>
                  <Link href={buildUrl({ category: key })}>
                    <Icon className={`h-4 w-4 ${cat.color}`} />
                    <span>{cat.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Knowledge Domains (All 50+) */}
      <SidebarCollapsibleSection title="Knowledge Domains" defaultOpen={false}>
        <div className="max-h-[400px] overflow-y-auto">
          {Object.entries(KNOWLEDGE_DOMAIN_CATEGORIES).map(([catKey, cat]) => {
            const CatIcon = cat.icon
            return (
              <div key={catKey} className="mb-3">
                <div className="px-3 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <CatIcon className={`h-3 w-3 ${cat.color}`} />
                  {cat.label}
                </div>
                <SidebarMenu>
                  {cat.domains.map((domain) => (
                    <SidebarMenuItem key={domain.value}>
                      <SidebarMenuButton asChild data-active={isDomainActive(domain.value)} className="h-7 text-xs">
                        <Link href={buildUrl({ domain: domain.value })}>
                          <span className="truncate">{domain.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            )
          })}
        </div>
      </SidebarCollapsibleSection>

      {/* Therapeutic Areas */}
      <SidebarCollapsibleSection title="Therapeutic Areas" defaultOpen={false}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={!currentTherapeutic}>
              <Link href={buildUrl({ therapeutic: null })}>
                <CheckCircle2 className="h-4 w-4 text-gray-500" />
                <span>All Areas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {THERAPEUTIC_AREAS.map((area) => (
            <SidebarMenuItem key={area.value}>
              <SidebarMenuButton asChild data-active={isTherapeuticActive(area.value)}>
                <Link href={buildUrl({ therapeutic: area.value })}>
                  <Pill className="h-4 w-4 text-pink-500" />
                  <span>{area.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Lifecycle Status */}
      <SidebarCollapsibleSection title="Lifecycle Status" defaultOpen={false}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={!currentStatus}>
              <Link href={buildUrl({ status: null })}>
                <CheckCircle2 className="h-4 w-4 text-gray-500" />
                <span>All Status</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {STATUS_OPTIONS.map((status) => (
            <SidebarMenuItem key={status.value}>
              <SidebarMenuButton asChild data-active={isStatusActive(status.value)}>
                <Link href={buildUrl({ status: status.value })}>
                  <div className="h-4 w-4 flex items-center justify-center">
                    <div className={`h-2 w-2 rounded-full ${status.color}`} />
                  </div>
                  <span>{status.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Access Level */}
      <SidebarCollapsibleSection title="Access Level" defaultOpen={false}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-active={!currentAccess}>
              <Link href={buildUrl({ access: null })}>
                <CheckCircle2 className="h-4 w-4 text-gray-500" />
                <span>All Levels</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {ACCESS_OPTIONS.map((access) => (
            <SidebarMenuItem key={access.value}>
              <SidebarMenuButton asChild data-active={isAccessActive(access.value)}>
                <Link href={buildUrl({ access: access.value })}>
                  <Lock className="h-4 w-4 text-amber-500" />
                  <span>{access.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Quick Actions */}
      <SidebarCollapsibleSection title="Quick Actions" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/knowledge/upload">
                <Upload className="h-4 w-4" />
                <span>Upload Content</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/knowledge?tab=search">
                <SearchIcon className="h-4 w-4" />
                <span>Search Library</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarKnowledgeContent

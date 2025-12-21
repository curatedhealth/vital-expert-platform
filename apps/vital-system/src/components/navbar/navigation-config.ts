/**
 * VITAL Platform Navigation Configuration
 *
 * Centralized navigation structure for MainNavbar and Command Palette
 * Structure: Hub | Consult | Discover | Craft | Optimize | Admin
 *
 * @version 2.0.0
 * @status A+ Production Ready
 */

import {
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
  FileText,
  Zap,
  Palette,
  Layers,
  Bot,
  UsersRound,
  GitBranch,
  Network,
  UserCircle,
  type LucideIcon,
} from 'lucide-react'

// ============================================
// TYPES
// ============================================

export interface NavigationItem {
  label: string
  href: string
  description: string
  icon: LucideIcon
  badge?: string
  isNew?: boolean
}

export interface NavigationSection {
  id: string
  label: string
  icon: LucideIcon
  description: string
  items: NavigationItem[]
  gradient?: {
    from: string
    via?: string
    to: string
  }
}

// ============================================
// NAVIGATION SECTIONS
// ============================================

/**
 * SERVICES - Core AI consultation services
 * Search, Ask (Mode 1&2), Consult (Panel), Delegate (Mode 3&4), Deliver (Workflows)
 */
export const consultItems: NavigationItem[] = [
  {
    label: 'Search',
    href: '/search',
    description: 'Discover agents, knowledge & tools',
    icon: Search,
  },
  {
    label: 'Ask',
    href: '/ask',
    description: 'Interactive 1:1 expert consultation (Mode 1 & 2)',
    icon: MessageSquare,
  },
  {
    label: 'Consult',
    href: '/consult',
    description: 'Multi-expert panel discussions',
    icon: Users,
  },
  {
    label: 'Delegate',
    href: '/delegate',
    description: 'Deep research & background tasks (Mode 3 & 4)',
    icon: Brain,
  },
  {
    label: 'Deliver',
    href: '/deliver',
    description: 'Execute automated AI workflows',
    icon: Workflow,
  },
]

/**
 * CRAFT - Build and design tools
 * Agent Builder, Workflow Studio, Panel Designer, etc.
 */
export const craftItems: NavigationItem[] = [
  {
    label: 'Agent Builder',
    href: '/designer/agent',
    description: 'Design and configure custom AI agents',
    icon: Bot,
  },
  {
    label: 'Workflow Studio',
    href: '/workflows',
    description: 'Build automated workflows and processes',
    icon: GitBranch,
  },
  {
    label: 'Panel Designer',
    href: '/designer/panel',
    description: 'Create multi-expert panel configurations',
    icon: UsersRound,
  },
  {
    label: 'Solution Builder',
    href: '/solution-builder',
    description: 'Build custom solutions',
    icon: Wrench,
  },
  {
    label: 'Knowledge Builder',
    href: '/designer/knowledge',
    description: 'Create and manage knowledge bases for RAG',
    icon: BookOpen,
  },
]

/**
 * DISCOVER - Browse and explore assets
 * Agents, Skills, Tools, Knowledge, Prompts
 */
export const discoverItems: NavigationItem[] = [
  {
    label: 'Agents',
    href: '/agents',
    description: 'Browse expert AI agents',
    icon: Brain,
  },
  {
    label: 'Skills',
    href: '/discover/skills',
    description: 'Agent skills and capabilities',
    icon: Zap,
  },
  {
    label: 'Missions',
    href: '/missions',
    description: 'Mission templates and runners',
    icon: Workflow,
  },
  {
    label: 'Tools',
    href: '/discover/tools',
    description: 'Browse available tools and integrations',
    icon: Wrench,
  },
  {
    label: 'Knowledge',
    href: '/knowledge',
    description: 'Domain knowledge base',
    icon: BookOpen,
  },
  {
    label: 'Prompts',
    href: '/prism',
    description: 'Prompt templates and patterns',
    icon: Lightbulb,
  },
]

/**
 * OPTIMIZE - Analytics, insights and strategy
 * JTBD, Personas, Ontology, Value View, Insights
 */
export const optimizeItems: NavigationItem[] = [
  {
    label: 'Jobs-to-be-Done',
    href: '/optimize/jobs-to-be-done',
    description: 'JTBD framework and outcome mapping',
    icon: Target,
  },
  {
    label: 'Personas',
    href: '/optimize/personas',
    description: 'User personas and organizational archetypes',
    icon: UserCircle,
  },
  {
    label: 'Ontology',
    href: '/optimize/ontology',
    description: 'Interactive graph visualization of the enterprise',
    icon: Network,
  },
  {
    label: 'Value View',
    href: '/value',
    description: 'Value drivers and strategic priorities',
    icon: Layers,
  },
  {
    label: 'Insights',
    href: '/medical-strategy',
    description: 'Evidence-based decision making and strategy',
    icon: FileText,
  },
]

// ============================================
// NAVIGATION SECTIONS (for menu rendering)
// ============================================

export const navigationSections: NavigationSection[] = [
  {
    id: 'hub',
    label: 'Hub',
    icon: LayoutDashboard,
    description: 'Your dashboard and home',
    items: [],
    gradient: { from: 'primary/5', to: 'primary/10' },
  },
  {
    id: 'consult',
    label: 'Consult',
    icon: MessageSquare,
    description: 'AI-powered consultation services',
    items: consultItems,
    gradient: { from: 'primary/5', to: 'primary/10' },
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: Search,
    description: 'Browse and explore platform assets',
    items: discoverItems,
    gradient: { from: 'blue-500/5', via: 'transparent', to: 'cyan-500/5' },
  },
  {
    id: 'craft',
    label: 'Craft',
    icon: Palette,
    description: 'Build and design your AI solutions',
    items: craftItems,
    gradient: { from: 'pink-500/5', via: 'transparent', to: 'orange-500/5' },
  },
  {
    id: 'optimize',
    label: 'Optimize',
    icon: Layers,
    description: 'Analytics, insights and value tracking',
    items: optimizeItems,
    gradient: { from: 'green-500/5', via: 'transparent', to: 'emerald-500/5' },
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    description: 'Platform administration',
    items: [],
    gradient: { from: 'slate-500/5', to: 'slate-500/10' },
  },
]

// ============================================
// QUICK ACTIONS
// ============================================

export const quickActions: NavigationItem[] = [
  {
    label: 'New Expert Chat',
    href: '/ask-expert',
    description: 'Start a new AI consultation',
    icon: MessageSquare,
  },
  {
    label: 'New Panel',
    href: '/ask-panel',
    description: 'Create a multi-expert discussion',
    icon: Users,
  },
  {
    label: 'New Workflow',
    href: '/workflows',
    description: 'Build an automated workflow',
    icon: Workflow,
  },
  {
    label: 'Browse Agents',
    href: '/agents',
    description: 'Explore available AI agents',
    icon: Brain,
  },
]

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

export const keyboardShortcuts = {
  commandPalette: { key: 'k', modifier: 'meta' },
  search: { key: '/', modifier: null },
  newChat: { key: 'n', modifier: 'meta' },
  escape: { key: 'Escape', modifier: null },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all navigation items as a flat array
 * Useful for search/command palette
 */
export function getAllNavigationItems(): NavigationItem[] {
  return [
    ...consultItems,
    ...discoverItems,
    ...craftItems,
    ...optimizeItems,
  ]
}

/**
 * Find navigation item by href
 */
export function findNavigationItem(href: string): NavigationItem | undefined {
  return getAllNavigationItems().find(item => item.href === href)
}

/**
 * Get section by ID
 */
export function getNavigationSection(id: string): NavigationSection | undefined {
  return navigationSections.find(section => section.id === id)
}

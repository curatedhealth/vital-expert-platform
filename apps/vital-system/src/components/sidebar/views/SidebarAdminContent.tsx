"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Activity,
  Bot,
  Building2,
  Cloud,
  DollarSign,
  FileText,
  Home,
  Layers,
  MessageSquare,
  Server,
  Settings,
  Shield,
  Star,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarCollapsibleSection } from "../shared"

/**
 * Admin sidebar content.
 * Comprehensive admin navigation for users, AI resources, analytics, LLM management, and organization.
 * [PROD] - Production ready
 */
export function SidebarAdminContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentView = searchParams.get('view') || 'overview'

  const handleNavigation = (view: string) => {
    router.push(`/admin?view=${view}`)
  }

  const isActive = (view: string) => currentView === view

  return (
    <>
      {/* Overview */}
      <SidebarCollapsibleSection title="Overview" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('executive')}
              isActive={isActive('executive')}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Executive Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('overview')}
              isActive={isActive('overview')}
            >
              <Home className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* User & Access */}
      <SidebarCollapsibleSection title="User & Access" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('users')}
              isActive={isActive('users')}
            >
              <Users className="h-4 w-4" />
              <span>Users</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* AI Resources */}
      <SidebarCollapsibleSection title="AI Resources" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('agents')}
              isActive={isActive('agents')}
            >
              <Bot className="h-4 w-4" />
              <span>Agents</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('prompts')}
              isActive={isActive('prompts')}
            >
              <FileText className="h-4 w-4" />
              <span>Prompts</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('tools')}
              isActive={isActive('tools')}
            >
              <Settings className="h-4 w-4" />
              <span>Tools</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Analytics & Monitoring */}
      <SidebarCollapsibleSection title="Analytics & Monitoring" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('agent-analytics')}
              isActive={isActive('agent-analytics')}
            >
              <Activity className="h-4 w-4" />
              <span>Agent Analytics</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('feedback-analytics')}
              isActive={isActive('feedback-analytics')}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Feedback Analytics</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('usage-analytics')}
              isActive={isActive('usage-analytics')}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Usage Analytics</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('services-analytics')}
              isActive={isActive('services-analytics')}
            >
              <Cloud className="h-4 w-4" />
              <span>Services Analytics</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('system-monitoring')}
              isActive={isActive('system-monitoring')}
            >
              <Zap className="h-4 w-4" />
              <span>System Monitoring</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* LLM Management */}
      <SidebarCollapsibleSection title="LLM Management" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('llm-providers')}
              isActive={isActive('llm-providers')}
            >
              <Server className="h-4 w-4" />
              <span>Providers</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('llm-cost-tracking')}
              isActive={isActive('llm-cost-tracking')}
            >
              <DollarSign className="h-4 w-4" />
              <span>Cost Tracking</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Capabilities & Skills */}
      <SidebarCollapsibleSection title="Capabilities & Skills" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('capabilities')}
              isActive={isActive('capabilities')}
            >
              <Zap className="h-4 w-4" />
              <span>Capabilities</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('skills')}
              isActive={isActive('skills')}
            >
              <Star className="h-4 w-4" />
              <span>Skills</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Panel Management */}
      <SidebarCollapsibleSection title="Panel Management" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('ask-panel')}
              isActive={isActive('ask-panel')}
            >
              <Users className="h-4 w-4" />
              <span>Ask Panel</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('expert-panel')}
              isActive={isActive('expert-panel')}
            >
              <User className="h-4 w-4" />
              <span>Expert Panel</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>

      {/* Organization */}
      <SidebarCollapsibleSection title="Organization" defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('organizations')}
              isActive={isActive('organizations')}
            >
              <Building2 className="h-4 w-4" />
              <span>Organizations</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('functions')}
              isActive={isActive('functions')}
            >
              <Layers className="h-4 w-4" />
              <span>Functions</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('roles')}
              isActive={isActive('roles')}
            >
              <Shield className="h-4 w-4" />
              <span>Roles</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('personas')}
              isActive={isActive('personas')}
            >
              <User className="h-4 w-4" />
              <span>Personas</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarCollapsibleSection>
    </>
  )
}

export default SidebarAdminContent

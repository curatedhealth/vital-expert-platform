"use client"

import * as React from "react"
import {
  Home,
  FolderOpen,
  MessageSquare,
  FileText,
  Settings,
  Brain,
  Target,
  TestTube,
  Play,
  BookOpen,
  User,
  Building,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// VITALpath application data
const getVitalData = (user: any) => ({
  user: {
    name: user?.user_metadata?.full_name || user?.email || "User",
    email: user?.email || "user@vitalpath.com",
    avatar: user?.user_metadata?.avatar_url || "/avatars/default.jpg",
  },
  teams: [
    {
      name: "VITALpath",
      logo: Building,
      plan: "Professional",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: FolderOpen,
    },
    {
      title: "AI Chat",
      url: "/dashboard/chat",
      icon: MessageSquare,
      badge: "New",
    },
    {
      title: "AI Agents",
      url: "/dashboard/agents",
      icon: Users,
    },
    {
      title: "Knowledge",
      url: "/dashboard/knowledge",
      icon: FileText,
    },
    {
      title: "JTBD Library",
      url: "/dashboard/jtbd",
      icon: Target,
      badge: "New",
    },
    {
      title: "VITAL Framework",
      url: "#",
      icon: Brain,
      items: [
        {
          title: "Vision",
          url: "/dashboard/vision",
          icon: Brain,
        },
        {
          title: "Integrate",
          url: "/dashboard/integrate",
          icon: Target,
        },
        {
          title: "Test",
          url: "/dashboard/test",
          icon: TestTube,
        },
        {
          title: "Activate",
          url: "/dashboard/activate",
          icon: Play,
        },
        {
          title: "Learn",
          url: "/dashboard/learn",
          icon: BookOpen,
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      items: [
        {
          title: "Profile",
          url: "/dashboard/settings/profile",
        },
        {
          title: "Organization",
          url: "/dashboard/settings/organization",
        },
        {
          title: "Preferences",
          url: "/dashboard/settings/preferences",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Digital Therapeutics Platform",
      url: "/dashboard/projects/1",
      icon: Brain,
    },
    {
      name: "Medical Device Integration",
      url: "/dashboard/projects/2",
      icon: Target,
    },
    {
      name: "Clinical Trial Management",
      url: "/dashboard/projects/3",
      icon: TestTube,
    },
  ],
})

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: any;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const data = getVitalData(user);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

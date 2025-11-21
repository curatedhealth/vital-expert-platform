"use client"

import { Agent } from "@/types"
import { AgentAvatar } from "@vital/ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Sparkles, MessageSquare, Clock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface AgentPreviewCardProps {
  agent: Agent
  isSelected: boolean
  onSelect: () => void
  children: React.ReactNode
  stats?: {
    totalConversations?: number
    avgResponseTime?: string
    successRate?: number
  }
}

export function AgentPreviewCard({
  agent,
  isSelected,
  onSelect,
  children,
  stats,
}: AgentPreviewCardProps) {
  return (
    <HoverCard openDelay={300} closeDelay={200}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={12}
        className="w-96 p-0 overflow-hidden"
      >
        <div className="relative">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-br from-vital-primary-500 to-vital-primary-700 px-4 py-3 text-white">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AgentAvatar
                  agent={agent}
                  size="lg"
                  className="w-12 h-12 border-2 border-white/20 shadow-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base truncate">{agent.displayName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-none">
                    Tier {agent.tier}
                  </Badge>
                  {agent.capabilities && agent.capabilities.length > 0 && (
                    <Badge variant="secondary" className="text-xs bg-white/20 text-white border-none">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {agent.capabilities.length} skills
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Description */}
            <div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {agent.description || "Expert AI agent ready to assist you with specialized tasks."}
              </p>
            </div>

            {/* Expertise/Capabilities */}
            {agent.capabilities && agent.capabilities.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Expertise
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {agent.capabilities.slice(0, 6).map((capability, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                  {agent.capabilities.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{agent.capabilities.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                {stats.totalConversations !== undefined && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <MessageSquare className="h-3 w-3" />
                    </div>
                    <div className="text-sm font-semibold">{stats.totalConversations}</div>
                    <div className="text-xs text-muted-foreground">Chats</div>
                  </div>
                )}
                {stats.avgResponseTime && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                    </div>
                    <div className="text-sm font-semibold">{stats.avgResponseTime}</div>
                    <div className="text-xs text-muted-foreground">Avg Time</div>
                  </div>
                )}
                {stats.successRate !== undefined && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <TrendingUp className="h-3 w-3" />
                    </div>
                    <div className="text-sm font-semibold">{stats.successRate}%</div>
                    <div className="text-xs text-muted-foreground">Success</div>
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
              }}
              className={cn(
                "w-full",
                isSelected
                  ? "bg-vital-primary-600 hover:bg-vital-primary-700"
                  : "bg-vital-primary-500 hover:bg-vital-primary-600"
              )}
              size="sm"
            >
              {isSelected ? (
                <>
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                  Selected for Chat
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Add to Consultation
                </>
              )}
            </Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

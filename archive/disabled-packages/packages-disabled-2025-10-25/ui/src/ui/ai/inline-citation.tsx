"use client"

import * as React from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface Source {
  url: string
  title?: string
  description?: string
  date?: string
  authors?: string[]
}

interface InlineCitationProps {
  children: React.ReactNode
  className?: string
}

export function InlineCitation({ children, className }: InlineCitationProps) {
  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      {children}
    </span>
  )
}

interface InlineCitationTextProps {
  children: React.ReactNode
}

export function InlineCitationText({ children }: InlineCitationTextProps) {
  return <span>{children}</span>
}

interface InlineCitationCardProps {
  children: React.ReactNode
}

export function InlineCitationCard({ children }: InlineCitationCardProps) {
  return <HoverCard openDelay={200}>{children}</HoverCard>
}

interface InlineCitationCardTriggerProps {
  sources: string[]
  className?: string
}

export function InlineCitationCardTrigger({
  sources,
  className
}: InlineCitationCardTriggerProps) {
  const uniqueHostnames = React.useMemo(() => {
    const hostnames = sources.map(url => {
      try {
        return new URL(url).hostname.replace('www.', '')
      } catch {
        return 'source'
      }
    })
    return Array.from(new Set(hostnames))
  }, [sources])

  return (
    <HoverCardTrigger asChild>
      <sup className="cursor-pointer">
        <Badge
          variant="outline"
          className={cn(
            "h-5 px-1.5 text-[10px] font-medium hover:bg-muted transition-colors",
            className
          )}
        >
          {uniqueHostnames.length > 1
            ? `${uniqueHostnames[0]}+${uniqueHostnames.length - 1}`
            : uniqueHostnames[0]
          }
        </Badge>
      </sup>
    </HoverCardTrigger>
  )
}

interface InlineCitationCardBodyProps {
  children: React.ReactNode
}

export function InlineCitationCardBody({ children }: InlineCitationCardBodyProps) {
  return (
    <HoverCardContent className="w-80 p-3" align="start">
      {children}
    </HoverCardContent>
  )
}

interface InlineCitationCarouselProps {
  children: React.ReactNode
}

export function InlineCitationCarousel({ children }: InlineCitationCarouselProps) {
  return <div className="space-y-2">{children}</div>
}

interface InlineCitationCarouselContentProps {
  children: React.ReactNode
}

export function InlineCitationCarouselContent({
  children
}: InlineCitationCarouselContentProps) {
  return <div className="space-y-2">{children}</div>
}

interface InlineCitationCarouselItemProps {
  children: React.ReactNode
}

export function InlineCitationCarouselItem({
  children
}: InlineCitationCarouselItemProps) {
  return <div>{children}</div>
}

interface InlineCitationSourceProps extends Source {
  index?: number
}

export function InlineCitationSource({
  url,
  title,
  description,
  date,
  authors,
  index
}: InlineCitationSourceProps) {
  const hostname = React.useMemo(() => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return 'Unknown source'
    }
  }, [url])

  // Format Harvard citation
  const harvardCitation = React.useMemo(() => {
    const year = date ? new Date(date).getFullYear() : 'n.d.'
    const authorText = authors && authors.length > 0
      ? authors.length === 1
        ? authors[0]
        : authors.length === 2
          ? `${authors[0]} and ${authors[1]}`
          : `${authors[0]} et al.`
      : hostname

    return `${authorText} (${year})`
  }, [authors, date, hostname])

  return (
    <div className="space-y-2 border-l-2 border-muted pl-3">
      {index !== undefined && (
        <div className="text-xs font-medium text-muted-foreground">
          Source {index + 1}
        </div>
      )}

      <div className="space-y-1">
        <div className="text-sm font-semibold leading-tight">
          {title || hostname}
        </div>

        <div className="text-xs text-muted-foreground">
          {harvardCitation}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <span className="truncate max-w-[200px]">{hostname}</span>
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </a>
      </div>
    </div>
  )
}

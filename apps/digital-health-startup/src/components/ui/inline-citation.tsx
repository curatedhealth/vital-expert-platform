"use client"

import * as React from "react"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"

export interface Citation {
  number: number
  text: string
  sourceId?: string
}

export interface InlineCitation extends Citation {
  source?: {
    title?: string
    url?: string
    metadata?: {
      domain?: string
      year?: string
      [key: string]: any
    }
  }
}

interface InlineCitationProps {
  citation: InlineCitation
  className?: string
  onCitationClick?: (citation: InlineCitation) => void
}

export function InlineCitation({
  citation,
  className,
  onCitationClick,
}: InlineCitationProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge
          variant="secondary"
          className={cn(
            "cursor-pointer hover:bg-primary/10 transition-colors",
            "text-xs font-mono px-1.5 py-0.5",
            className
          )}
          onClick={() => onCitationClick?.(citation)}
        >
          [{citation.number}]
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top">
        <div className="space-y-2">
          {citation.source?.title && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-sm font-medium leading-tight">
                {citation.source.title}
              </p>
            </div>
          )}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {citation.text}
          </p>
          {citation.source?.metadata && (
            <div className="flex gap-1 flex-wrap pt-1">
              {citation.source.metadata.domain && (
                <Badge variant="outline" className="text-xs">
                  {citation.source.metadata.domain}
                </Badge>
              )}
              {citation.source.metadata.year && (
                <Badge variant="outline" className="text-xs">
                  {citation.source.metadata.year}
                </Badge>
              )}
            </div>
          )}
          {citation.source?.url && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              asChild
            >
              <a
                href={citation.source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View source →
              </a>
            </Button>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

interface InlineCitationsProps {
  citations: InlineCitation[]
  className?: string
  onCitationClick?: (citation: InlineCitation) => void
}

export function InlineCitations({
  citations,
  className,
  onCitationClick,
}: InlineCitationsProps) {
  if (!citations || citations.length === 0) {
    return null
  }

  return (
    <div className={cn("inline-flex gap-1 flex-wrap", className)}>
      {citations.map((citation, index) => (
        <InlineCitation
          key={citation.sourceId || index}
          citation={citation}
          onCitationClick={onCitationClick}
        />
      ))}
    </div>
  )
}


"use client"

import * as React from "react"
import { ChevronDown, ExternalLink, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export interface Source {
  id: string
  title: string
  url?: string
  content?: string
  metadata?: {
    domain?: string
    year?: string
    document_type?: string
    [key: string]: any
  }
  similarity?: number
}

interface CollapsibleSourcesProps {
  sources: Source[]
  className?: string
}

export function CollapsibleSources({ sources, className }: CollapsibleSourcesProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  if (!sources || sources.length === 0) {
    return null
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("w-full", className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">
              {sources.length} {sources.length === 1 ? "Source" : "Sources"}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-2">
        {sources.map((source, index) => (
          <Card
            key={source.id || index}
            className="p-3 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium leading-none">
                    {index + 1}. {source.title || "Untitled Source"}
                  </span>
                  {source.metadata?.domain && (
                    <Badge variant="secondary" className="text-xs">
                      {source.metadata.domain}
                    </Badge>
                  )}
                  {source.metadata?.year && (
                    <Badge variant="outline" className="text-xs">
                      {source.metadata.year}
                    </Badge>
                  )}
                </div>
                {source.content && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {source.content.substring(0, 150)}...
                  </p>
                )}
                {source.metadata?.document_type && (
                  <p className="text-xs text-muted-foreground">
                    Type: {source.metadata.document_type}
                  </p>
                )}
                {source.similarity && (
                  <p className="text-xs text-muted-foreground">
                    Relevance: {(source.similarity * 100).toFixed(1)}%
                  </p>
                )}
              </div>
              {source.url && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  asChild
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open source"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}


/**
 * VITAL Platform - StreamingResponse Component (shared/ui/ai variant)
 * 
 * @deprecated This component is deprecated. Use VitalStreamText or components/ai/StreamingResponse instead.
 * 
 * Migration guide:
 * - For Phase 3 components: import { VitalStreamText } from '@/shared/components/vital-ai-ui/conversation'
 * - For Streamdown-based rendering: import { StreamingResponse } from '@/components/ai/streaming-response'
 * 
 * This component will be removed in a future release.
 */
"use client"

import React, { useState, useEffect, useRef } from 'react'

import { cn } from '@vital/ui/lib/utils'

import { StreamingMarkdown, StreamingMarkdownEnhanced } from './streaming-markdown'

interface StreamingResponseProps {
  content: string
  isStreaming?: boolean
  className?: string
  variant?: 'default' | 'enhanced'
  showCursor?: boolean
}

/**
 * @deprecated Use VitalStreamText or components/ai/StreamingResponse instead.
 */
export function StreamingResponse({ 
  content, 
  isStreaming = false,
  className,
  variant = 'enhanced',
  showCursor = true
}: StreamingResponseProps) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  // Emit deprecation warning in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[DEPRECATED] StreamingResponse (shared/ui/ai) is deprecated. ' +
        'Use VitalStreamText from @/shared/components/vital-ai-ui/conversation or ' +
        'StreamingResponse from @/components/ai/streaming-response instead.'
      );
    }
  }, []);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content)
      setIsComplete(true)
      return
    }

    // For streaming, reveal content progressively
    let currentIndex = 0;
    const totalLength = content.length;
    setDisplayedContent('')
    setIsComplete(false)

    const interval = setInterval(() => {
      if (currentIndex < totalLength) {
        // Reveal content character by character for smoother streaming
        setDisplayedContent(content.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, 20) // Character by character streaming

    return () => clearInterval(interval)
  }, [content, isStreaming])

  const containerRef = useRef<HTMLDivElement>(null)
  const MarkdownComponent = variant === 'enhanced' ? StreamingMarkdownEnhanced : StreamingMarkdown

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (containerRef.current && isStreaming) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [displayedContent, isStreaming])

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        className
      )}
    >
      <MarkdownComponent 
        content={displayedContent}
        isStreaming={isStreaming && !isComplete}
        className="w-full"
      />
      
      {/* Streaming indicator */}
      {isStreaming && !isComplete && showCursor && (
        <div className="inline-flex items-center ml-2">
          <div className="w-0.5 h-4 bg-purple-600 animate-pulse" />
        </div>
      )}
    </div>
  )
}

// Specialized component for AI agent responses
export function AgentResponse({ 
  content, 
  isStreaming = false,
  agentName,
  className 
}: {
  content: string
  isStreaming?: boolean
  agentName?: string
  className?: string
}) {
  return (
    <div className={cn(
      "bg-white rounded-lg p-4 shadow-sm border",
      "prose prose-sm max-w-none",
      className
    )}>
      <StreamingResponse 
        content={content}
        isStreaming={isStreaming}
        variant="enhanced"
        showCursor={true}
      />
      
      {agentName && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <div className="flex items-center space-x-2 text-xs text-neutral-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Response from {agentName}</span>
            {isStreaming && (
              <span className="text-purple-600">• Streaming</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Component for handling streaming chat messages
export function StreamingMessage({ 
  content, 
  isStreaming = false,
  role = 'assistant',
  className 
}: {
  content: string
  isStreaming?: boolean
  role?: 'user' | 'assistant'
  className?: string
}) {
  if (role === 'user') {
    return (
      <div className={cn(
        "bg-blue-50 rounded-lg p-4 border border-blue-200",
        className
      )}>
        <div className="text-neutral-800 whitespace-pre-wrap">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "bg-white rounded-lg p-4 shadow-sm border",
      className
    )}>
      <StreamingResponse 
        content={content}
        isStreaming={isStreaming}
        variant="enhanced"
        showCursor={true}
      />
    </div>
  )
}

"use client"

import React, { useState, useEffect } from 'react'

import { cn } from '@vital/ui/lib/utils'

interface StreamingMarkdownProps {
  content: string
  className?: string
  isStreaming?: boolean
}

export function StreamingMarkdown({ 
  content, 
  className,
  isStreaming = false 
}: StreamingMarkdownProps) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content)
      setIsComplete(true)
      return
    }

    // For streaming, gradually reveal content
    const words = content.split(' ')
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedContent(words.slice(0, currentIndex + 1).join(' '))
        currentIndex++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, 50) // Adjust speed as needed

    return () => clearInterval(interval)
  }, [content, isStreaming])

  // Simple markdown parsing for streaming
  const parseMarkdown = (text: string) => {
    let parsed = text

    // Handle bold text
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    // Handle italic text
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Handle code blocks
    parsed = parsed.replace(/```([\s\S]*?)```/g, '<pre class="bg-neutral-100 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>')
    
    // Handle inline code
    parsed = parsed.replace(/`([^`]+)`/g, '<code class="bg-neutral-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    
    // Handle links
    parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Handle headers
    parsed = parsed.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    parsed = parsed.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
    parsed = parsed.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    
    // Handle lists
    parsed = parsed.replace(/^\* (.*$)/gm, '<li class="ml-4">• $1</li>')
    parsed = parsed.replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
    parsed = parsed.replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
    
    // Handle line breaks
    parsed = parsed.replace(/\n/g, '<br>')
    
    // Wrap consecutive list items in ul
    parsed = parsed.replace(/(<li class="ml-4">.*<\/li>)/g, (match) => {
      return `<ul class="list-disc list-inside space-y-1">${match}</ul>`
    })

    return parsed
  }

  const renderContent = () => {
    if (!displayedContent) return null

    const parsed = parseMarkdown(displayedContent)

    return (
      <div
        className={cn(
          "prose prose-sm max-w-none",
          "prose-headings:text-neutral-900 prose-headings:font-semibold",
          "prose-p:text-neutral-700 prose-p:leading-relaxed",
          "prose-strong:text-neutral-900 prose-strong:font-semibold",
          "prose-code:text-neutral-800 prose-code:bg-neutral-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
          "prose-pre:bg-neutral-100 prose-pre:border prose-pre:rounded-lg",
          "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline",
          "prose-ul:list-disc prose-ul:ml-4",
          "prose-li:text-neutral-700",
          className
        )}
        dangerouslySetInnerHTML={{ __html: parsed }}
      />
    )
  }

  return (
    <div className="relative">
      {renderContent()}
      {isStreaming && !isComplete && (
        <div className="inline-block w-2 h-4 bg-purple-600 animate-pulse ml-1" />
      )}
    </div>
  )
}

// Enhanced streaming markdown with syntax highlighting
export function StreamingMarkdownEnhanced({ 
  content, 
  className,
  isStreaming = false 
}: StreamingMarkdownProps) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content)
      setIsComplete(true)
      return
    }

    // For streaming, reveal content character by character for smoother effect
    let currentIndex = 0;
    setDisplayedContent('')
    setIsComplete(false)

    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, 25) // Slightly slower for better visibility

    return () => clearInterval(interval)
  }, [content, isStreaming])

  const parseMarkdownEnhanced = (text: string) => {
    let parsed = text

    // Handle code blocks with language detection (do this first to avoid conflicts)
    parsed = parsed.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {

      return `<div class="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto my-4">
        <div class="text-xs text-neutral-400 mb-2 font-mono">${language}</div>
        <pre><code class="language-${language}">${code.trim()}</code></pre>
      </div>`
    })
    
    // Handle inline code
    parsed = parsed.replace(/`([^`]+)`/g, '<code class="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded text-sm font-mono border">$1</code>')
    
    // Handle bold text
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-neutral-900">$1</strong>')
    
    // Handle italic text
    parsed = parsed.replace(/\*(.*?)\*/g, '<em class="italic text-neutral-700">$1</em>')
    
    // Handle links with better styling
    parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Handle headers with better hierarchy
    parsed = parsed.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-neutral-900 mt-6 mb-3 border-b border-neutral-200 pb-1">$1</h3>')
    parsed = parsed.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-neutral-900 mt-8 mb-4 border-b border-neutral-300 pb-2">$1</h2>')
    parsed = parsed.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-neutral-900 mt-10 mb-6 border-b-2 border-purple-200 pb-3">$1</h1>')
    
    // Handle numbered lists first
    parsed = parsed.replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 text-neutral-700 leading-relaxed mb-2">$1. $2</li>')
    
    // Handle bullet lists
    parsed = parsed.replace(/^[\*\-\+] (.*$)/gm, '<li class="ml-4 text-neutral-700 leading-relaxed mb-2">• $1</li>')
    
    // Handle checkboxes
    parsed = parsed.replace(/^- \[ \] (.*$)/gm, '<li class="ml-4 text-neutral-700 leading-relaxed mb-2">☐ $1</li>')
    parsed = parsed.replace(/^- \[x\] (.*$)/gm, '<li class="ml-4 text-neutral-700 leading-relaxed mb-2">☑ $1</li>')
    
    // Handle blockquotes
    parsed = parsed.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-purple-300 pl-4 py-2 bg-purple-50 text-neutral-700 italic my-4">$1</blockquote>')
    
    // Handle horizontal rules
    parsed = parsed.replace(/^---$/gm, '<hr class="my-8 border-neutral-300" />')
    
    // Group consecutive list items into proper lists
    parsed = parsed.replace(/(<li class="ml-4 text-neutral-700 leading-relaxed mb-2">.*<\/li>)/g, (match) => {
      return `<ul class="space-y-1 my-3">${match}</ul>`
    })
    
    // Handle line breaks and paragraphs
    parsed = parsed.replace(/\n\n/g, '</p><p class="text-neutral-700 leading-relaxed mb-4">')
    parsed = parsed.replace(/\n/g, '<br>')
    
    // Wrap in paragraphs if not already wrapped
    if (!parsed.startsWith('<')) {
      parsed = `<p class="text-neutral-700 leading-relaxed mb-4">${parsed}</p>`
    }

    return parsed
  }

  const renderContent = () => {
    if (!displayedContent) return null
    const parsed = parseMarkdownEnhanced(displayedContent)

    return (
      <div 
        className={cn(
          "prose prose-sm max-w-none",
          className
        )}
        dangerouslySetInnerHTML={{ __html: parsed }}
      />
    )
  }

  return (
    <div className="relative">
      {renderContent()}
      {isStreaming && !isComplete && (
        <div className="inline-flex items-center ml-2">
          <div className="w-1 h-4 bg-purple-600 animate-pulse" />
          <div className="w-1 h-4 bg-purple-600 animate-pulse ml-1" style={{ animationDelay: '0.2s' }} />
          <div className="w-1 h-4 bg-purple-600 animate-pulse ml-1" style={{ animationDelay: '0.4s' }} />
        </div>
      )}
    </div>
  )
}

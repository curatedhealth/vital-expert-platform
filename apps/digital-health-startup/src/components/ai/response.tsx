"use client"

import { Check, Copy } from "lucide-react"
import * as React from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import type { PluggableList } from "unified"
import { Streamdown } from "streamdown"
import mermaid from "mermaid"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import "katex/dist/katex.min.css"

interface ResponseProps {
  children: string
  className?: string
  remarkPlugins?: PluggableList
  rehypePlugins?: PluggableList
  components?: Partial<Components>
  isStreaming?: boolean
}

export function Response({ children, className, remarkPlugins, rehypePlugins, components, isStreaming = false }: ResponseProps) {
  const extraRemarkPlugins = React.useMemo<PluggableList>(() => {
    if (!remarkPlugins) {
      return [];
    }
    return ([] as any[]).concat(remarkPlugins as any);
  }, [remarkPlugins]);

  const extraRehypePlugins = React.useMemo<PluggableList>(() => {
    if (!rehypePlugins) {
      return [];
    }
    return ([] as any[]).concat(rehypePlugins as any);
  }, [rehypePlugins]);

  const mergedRemarkPlugins = React.useMemo(
    () => [remarkGfm, remarkMath, ...extraRemarkPlugins],
    [extraRemarkPlugins]
  )

  const mergedRehypePlugins = React.useMemo(
    () => [rehypeKatex, ...extraRehypePlugins],
    [extraRehypePlugins]
  )

  const markdownComponents = React.useMemo<Components>(() => ({
    code(props: any) {
      const { node, inline, className, children, ...rest } = props
      const match = /language-(\w+)/.exec(className || "")
      const language = match ? match[1] : ""
      const code = String(children).replace(/\n$/, "")

      // Handle Mermaid diagrams
      if (!inline && (language === "mermaid" || language === "mmd")) {
        // ✅ ENABLED: Native Mermaid rendering with error fallback
        return <MermaidDiagram code={code} />
      }
      
      // ✅ IMPROVED: Handle ASCII diagrams with monospace font and copy button
      if (!inline && language === "ascii") {
        const [copied, setCopied] = React.useState(false)
        
        const handleCopy = () => {
          navigator.clipboard.writeText(code)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
        
        return (
          <div className="my-4 relative group">
            {/* Copy button */}
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={handleCopy}
                title="Copy ASCII diagram"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <pre className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-xs overflow-x-auto whitespace-pre">
              {code}
            </pre>
          </div>
        )
      }

      if (!inline && language) {
        return (
          <CodeBlock language={language} {...props}>
            {code}
          </CodeBlock>
        )
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
    strong({ children }) {
      const text = String(children)
      if (text.endsWith("*")) {
        return <>{text}</>
      }
      return <strong>{children}</strong>
    },
    em({ children }) {
      const text = String(children)
      if (text.endsWith("*") || text.endsWith("_")) {
        return <>{text}</>
      }
      return <em>{children}</em>
    },
    a({ href, children }) {
      if (!href || href.endsWith("(") || !children) {
        return <>{children || href}</>
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    },
    ...(components ?? {}),
  }), [components])

  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      {isStreaming ? (
        <Streamdown isAnimating={isStreaming}>
          <ReactMarkdown
            remarkPlugins={mergedRemarkPlugins}
            rehypePlugins={mergedRehypePlugins}
            components={markdownComponents}
          >
            {children}
          </ReactMarkdown>
        </Streamdown>
      ) : (
        <ReactMarkdown
          remarkPlugins={mergedRemarkPlugins}
          rehypePlugins={mergedRehypePlugins}
          components={markdownComponents}
        >
          {children}
        </ReactMarkdown>
      )}
    </div>
  )
}

// Initialize Mermaid once globally
let mermaidInitialized = false

// ✅ NEW: Error Boundary for Mermaid diagrams
class MermaidErrorBoundary extends React.Component<
  { children: React.ReactNode; code: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; code: string }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Mermaid Error Boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="my-4 p-4 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
            ⚠️ Mermaid Diagram Failed to Render
          </p>
          <p className="text-xs text-red-500 dark:text-red-300 mb-2">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <details className="mt-2">
            <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
              Show diagram code
            </summary>
            <pre className="text-xs overflow-auto mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded font-mono">
              {this.props.code}
            </pre>
          </details>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Tip: Copy code and paste into{' '}
            <a
              href="https://mermaid.live"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              mermaid.live
            </a>
            {' '}to visualize
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function MermaidDiagram({ code }: { code: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [svg, setSvg] = React.useState<string>('')
  
  React.useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | undefined
    
    const renderDiagram = async () => {
      if (!mounted) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        // Initialize mermaid only once with improved config
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            logLevel: 'error',
            suppressErrorRendering: false,
            // ✅ NEW: Better config for reliability
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: 'basis'
            }
          })
          mermaidInitialized = true
          console.log('✅ Mermaid initialized (v11)')
        }
        
        // Add timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted && isLoading) {
            setError('Rendering timed out (>5s). Diagram may be too complex.')
            setIsLoading(false)
          }
        }, 5000)
        
        // Generate unique ID
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        // ✅ IMPROVED: Better error handling
        console.log(`🎨 Rendering Mermaid diagram: ${id}`)
        const result = await mermaid.render(id, code)
        
        if (timeoutId) clearTimeout(timeoutId)
        
        if (mounted) {
          setSvg(result.svg)
          setIsLoading(false)
          console.log(`✅ Mermaid rendered successfully: ${id}`)
        }
      } catch (err: any) {
        if (timeoutId) clearTimeout(timeoutId)
        console.error("❌ Mermaid rendering error:", err)
        if (mounted) {
          // Extract meaningful error message
          let errorMsg = err?.message || err?.toString() || 'Failed to render diagram'
          // Clean up common error messages
          errorMsg = errorMsg
            .replace(/Parse error on line \d+:/, 'Syntax error:')
            .replace(/Expecting.*got.*/, 'Invalid syntax')
          setError(errorMsg)
          setIsLoading(false)
        }
      }
    }
    
    // Small delay to prevent blocking the UI
    const delayedRender = setTimeout(() => {
      renderDiagram()
    }, 10)
    
    return () => {
      mounted = false
      clearTimeout(delayedRender)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [code])
  
  // ✅ IMPROVED: Better error display
  if (error) {
    return (
      <div className="my-4 p-4 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
        <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
          ⚠️ Diagram Syntax Error
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-300 mb-3">{error}</p>
        <details className="mb-3">
          <summary className="text-xs text-yellow-700 dark:text-yellow-400 cursor-pointer hover:underline">
            Show diagram code →
          </summary>
          <pre className="text-xs overflow-auto mt-2 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded font-mono border border-yellow-200 dark:border-yellow-800">
            {code}
          </pre>
        </details>
        <div className="flex items-center gap-2 text-xs">
          <a
            href={`https://mermaid.live/edit#pako:${btoa(code)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
          >
            🔧 Debug in Mermaid Live
          </a>
          <span className="text-yellow-600 dark:text-yellow-400">
            (opens in new tab)
          </span>
        </div>
      </div>
    )
  }
  
  // ✅ IMPROVED: Better loading state
  if (isLoading) {
    return (
      <div className="my-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-600 animate-spin border-2 border-transparent border-t-gray-600 dark:border-t-gray-300"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Rendering diagram...
          </p>
        </div>
      </div>
    )
  }
  
  // ✅ IMPROVED: Render SVG with better styling and copy button
  return (
    <MermaidErrorBoundary code={code}>
      <div className="my-4 p-4 border rounded-lg bg-white dark:bg-gray-900 mermaid-diagram overflow-x-auto relative group">
        {/* ✅ NEW: Copy button for Mermaid diagrams */}
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              navigator.clipboard.writeText(code)
              // Optional: Show toast notification
              console.log('✅ Mermaid code copied to clipboard')
            }}
            title="Copy diagram code"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        <div 
          ref={ref}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </MermaidErrorBoundary>
  )
}

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  language: string
  children: string
}

function CodeBlock({ language, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [children])

  return (
    <div className="relative group" {...props}>
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

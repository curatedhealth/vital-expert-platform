"use client"

import { Check, Copy } from "lucide-react"
import * as React from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import "katex/dist/katex.min.css"

interface ResponseProps {
  children: string | React.ReactNode
  className?: string
}

export function Response({ children, className }: ResponseProps) {
  // If children is not a string (e.g., contains inline citations), just render with prose styling
  // The markdown is already processed in the parent component
  if (typeof children !== 'string') {
    return (
      <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
        {children}
      </div>
    )
  }

  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")
            const language = match ? match[1] : ""

            if (!inline && language) {
              return (
                <CodeBlock language={language} {...props}>
                  {String(children).replace(/\n$/, "")}
                </CodeBlock>
              )
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          // Auto-complete incomplete formatting during streaming
          strong({ children }) {
            const text = String(children)
            // If bold text doesn't end properly, hide it until complete
            if (text.endsWith("*")) {
              return <>{text}</>
            }
            return <strong>{children}</strong>
          },
          em({ children }) {
            const text = String(children)
            // If italic text doesn't end properly, hide it until complete
            if (text.endsWith("*") || text.endsWith("_")) {
              return <>{text}</>
            }
            return <em>{children}</em>
          },
          a({ href, children }) {
            // Hide incomplete links during streaming
            if (!href || href.endsWith("(") || !children) {
              return <>{children || href}</>
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            )
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
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

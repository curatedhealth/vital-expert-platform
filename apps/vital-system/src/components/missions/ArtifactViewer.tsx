/**
 * ArtifactViewer - Display mission artifacts with citations
 */

'use client'

import { useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  FileJson,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import type { Artifact, Citation } from '@/hooks/useAutonomousMode'

interface ArtifactViewerProps {
  artifacts: Artifact[]
  className?: string
}

function getArtifactIcon(name: string): React.ReactNode {
  const lower = name.toLowerCase()
  if (lower.includes('report')) return <FileText className="h-4 w-4" />
  if (lower.includes('analysis')) return <BookOpen className="h-4 w-4" />
  if (lower.includes('json') || lower.includes('data')) return <FileJson className="h-4 w-4" />
  if (lower.includes('image') || lower.includes('chart')) return <ImageIcon className="h-4 w-4" />
  return <FileText className="h-4 w-4" />
}

export function ArtifactViewer({ artifacts, className = '' }: ArtifactViewerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(artifacts.length === 1 ? artifacts[0].id : null)

  if (artifacts.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No artifacts generated yet</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Artifacts
        </h3>
        <span className="text-sm text-gray-500">
          {artifacts.length} {artifacts.length === 1 ? 'artifact' : 'artifacts'}
        </span>
      </div>

      <div className="space-y-3">
        {artifacts.map((artifact) => (
          <ArtifactCard
            key={artifact.id}
            artifact={artifact}
            isExpanded={expandedId === artifact.id}
            onToggle={() => setExpandedId(expandedId === artifact.id ? null : artifact.id)}
          />
        ))}
      </div>
    </div>
  )
}

function ArtifactCard({ artifact, isExpanded, onToggle }: { artifact: Artifact; isExpanded: boolean; onToggle: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(artifact.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    const blob = new Blob([artifact.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${artifact.name.replace(/\s+/g, '_')}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
        {/* Clickable area for toggle - excludes action buttons */}
        <div
          role="button"
          tabIndex={0}
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onToggle()
            }
          }}
          className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
        >
          <div className="flex-shrink-0 text-gray-500">{getArtifactIcon(artifact.name)}</div>
          <div className="min-w-0">
            <div className="font-medium truncate">{artifact.name}</div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span>Step: {artifact.step || 'n/a'}</span>
              {artifact.citations.length > 0 && (
                <>
                  <span>•</span>
                  <span>{artifact.citations.length} citations</span>
                </>
              )}
              {artifact.runner?.run_code && (
                <>
                  <span>•</span>
                  <span className="text-amber-700">Runner: {artifact.runner.run_code}</span>
                </>
              )}
              {artifact.cost !== undefined && (
                <>
                  <span>•</span>
                  <span className="text-emerald-700">${artifact.cost?.toFixed?.(2) ?? artifact.cost}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-gray-400 ml-auto">{isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</div>
        </div>

        {/* Action buttons - separate from toggle */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy content"
          >
            {copied ? '✅' : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t">
          <div className="p-4 bg-gray-50">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ArtifactContent content={artifact.content} />
            </div>
          </div>

          {artifact.citations.length > 0 && (
            <div className="p-4 border-t bg-white">
              <CitationList citations={artifact.citations} />
            </div>
          )}

          {artifact.artifactPath && (
            <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">Path: {artifact.artifactPath}</div>
          )}
        </div>
      )}
    </div>
  )
}

function ArtifactContent({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-base mt-4">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-lg mt-4">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-xl mt-4">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* '))
          return (
            <div key={i} className="flex items-start gap-2 ml-4">
              <span className="text-gray-400 mt-1.5">•</span>
              <span>{line.slice(2)}</span>
            </div>
          )
        const numberedMatch = line.match(/^(\d+)\.\s/)
        if (numberedMatch)
          return (
            <div key={i} className="flex items-start gap-2 ml-4">
              <span className="text-gray-500 font-medium">{numberedMatch[1]}.</span>
              <span>{line.slice(numberedMatch[0].length)}</span>
            </div>
          )
        const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        if (!line.trim()) return <div key={i} className="h-2" />
        return <p key={i} dangerouslySetInnerHTML={{ __html: boldProcessed }} />
      })}
    </div>
  )
}

function CitationList({ citations }: { citations: Citation[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        Citations ({citations.length})
      </h4>
      <ul className="space-y-2">
        {citations.map((citation, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-gray-400 font-mono text-xs mt-0.5">[{i + 1}]</span>
            <div className="flex-1 min-w-0">
              {citation.url ? (
                <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                  <span className="truncate">{citation.title || citation.id}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              ) : (
                <span className="text-gray-700">{citation.title || citation.id}</span>
              )}
              {citation.source && <span className="ml-2 text-xs text-gray-400">({citation.source})</span>}
              {citation.confidence !== undefined && (
                <span className="ml-2 text-xs text-gray-400">{Math.round((citation.confidence || 0) * 100)}% relevant</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function FinalReport({ content, artifacts, sources }: { content: string; artifacts: Artifact[]; sources: Citation[] }) {
  return (
    <div className="space-y-6">
      <div className="prose prose-sm max-w-none">
        <ArtifactContent content={content} />
      </div>
      {artifacts.length > 0 && (
        <div className="border-t pt-6">
          <ArtifactViewer artifacts={artifacts} />
        </div>
      )}
      {sources.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            All Sources ({sources.length})
          </h3>
          <CitationList citations={sources} />
        </div>
      )}
    </div>
  )
}

export default ArtifactViewer

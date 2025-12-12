/**
 * VITAL Platform - Artifact Renderers
 *
 * Unified exports for all artifact type renderers.
 * Each renderer wraps or extends core VITAL components for artifact-specific needs.
 *
 * Architecture (11 artifact types per v5 spec):
 * - MarkdownRenderer → wraps VitalStreamText (Streamdown)
 * - CodeRenderer → extends VitalCodeBlock pattern (simple mode delegates to VitalCodeBlock)
 * - ReactRenderer → sandboxed iframe for React component preview
 * - ChartRenderer → standalone Recharts integration with VITAL branding
 * - TableRenderer → wraps VitalDataTable
 * - MermaidRenderer → Mermaid.js diagrams with DOMPurify sanitization
 * - HtmlRenderer → DOMPurify sanitized HTML rendering
 * - JsonRenderer → interactive JSON tree viewer
 * - CsvRenderer → CSV parsing with sortable table display
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 * Phase 4 Implementation - December 11, 2025
 */

// Document/Markdown rendering
export { MarkdownRenderer } from './MarkdownRenderer';
export type { MarkdownRendererProps } from './MarkdownRenderer';

// Code rendering with syntax highlighting
export { CodeRenderer } from './CodeRenderer';
export type { CodeRendererProps } from './CodeRenderer';

// React component rendering (sandboxed iframe)
export { ReactRenderer } from './ReactRenderer';
export type { ReactRendererProps } from './ReactRenderer';

// Chart/visualization rendering
export { ChartRenderer } from './ChartRenderer';
export type { ChartRendererProps, ChartType, ChartDataPoint } from './ChartRenderer';

// Table/data grid rendering
export { TableRenderer } from './TableRenderer';
export type { TableRendererProps, TableColumn } from './TableRenderer';

// Mermaid diagram rendering (flowcharts, sequence, class, ER, gantt, etc.)
export { MermaidRenderer } from './MermaidRenderer';
export type { MermaidRendererProps } from './MermaidRenderer';

// HTML rendering (DOMPurify sanitized)
export { HtmlRenderer } from './HtmlRenderer';
export type { HtmlRendererProps } from './HtmlRenderer';

// JSON tree viewer
export { JsonRenderer } from './JsonRenderer';
export type { JsonRendererProps } from './JsonRenderer';

// CSV data rendering
export { CsvRenderer } from './CsvRenderer';
export type { CsvRendererProps } from './CsvRenderer';

// =============================================================================
// ARTIFACT TYPE → RENDERER MAPPING
// =============================================================================

import type { ComponentType } from 'react';
import type { ArtifactType } from '../../../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CodeRenderer } from './CodeRenderer';
import { ReactRenderer } from './ReactRenderer';
import { ChartRenderer } from './ChartRenderer';
import { TableRenderer } from './TableRenderer';
import { MermaidRenderer } from './MermaidRenderer';
import { HtmlRenderer } from './HtmlRenderer';
import { JsonRenderer } from './JsonRenderer';
import { CsvRenderer } from './CsvRenderer';

/**
 * Map artifact types to their corresponding renderer components.
 * Used by VitalArtifactPanel to dynamically render artifacts.
 *
 * v5 Spec: 11 artifact types with specialized renderers
 */
export const ARTIFACT_RENDERERS: Record<ArtifactType, ComponentType<{ content: string; [key: string]: unknown }>> = {
  // Core content types
  document: MarkdownRenderer as ComponentType<{ content: string; [key: string]: unknown }>,
  code: CodeRenderer as ComponentType<{ content: string; [key: string]: unknown }>,
  react: ReactRenderer as ComponentType<{ content: string; [key: string]: unknown }>,

  // Data visualization types
  chart: ChartRenderer as ComponentType<{ content: string; [key: string]: unknown }>,
  table: TableRenderer as ComponentType<{ content: string; [key: string]: unknown }>,
  diagram: MermaidRenderer as ComponentType<{ content: string; [key: string]: unknown }>,

  // Structured data types
  html: HtmlRenderer as ComponentType<{ content: string; [key: string]: unknown }>,
  json: JsonRenderer as ComponentType<{ content: string; [key: string]: unknown }>,
  csv: CsvRenderer as ComponentType<{ content: string; [key: string]: unknown }>,

  // Media types (fallback to Markdown for now)
  image: MarkdownRenderer as ComponentType<{ content: string; [key: string]: unknown }>,
  file: MarkdownRenderer as ComponentType<{ content: string; [key: string]: unknown }>,
};

/**
 * Get the appropriate renderer for an artifact type
 */
export function getArtifactRenderer(type: ArtifactType): ComponentType<{ content: string; [key: string]: unknown }> {
  return ARTIFACT_RENDERERS[type] || MarkdownRenderer;
}

/**
 * Detect artifact type from content using hint-based and pattern-based analysis.
 *
 * Detection order (most specific first):
 * 1. Explicit hint from user/AI
 * 2. HTML patterns (doctype, tags)
 * 3. Mermaid diagram patterns
 * 4. React component patterns (JSX)
 * 5. JSON structure analysis
 * 6. Code patterns (imports, functions)
 * 7. CSV structure analysis
 * 8. Default to document
 */
export function detectArtifactType(content: string, hint?: string): ArtifactType {
  const trimmedContent = content.trim();

  // =========================================================================
  // 1. HINT-BASED DETECTION (highest priority)
  // =========================================================================
  if (hint) {
    const normalizedHint = hint.toLowerCase();
    // React/JSX hints
    if (normalizedHint.includes('react') || normalizedHint.includes('jsx') || normalizedHint.includes('component')) return 'react';
    // HTML hints
    if (normalizedHint.includes('html') || normalizedHint.includes('webpage')) return 'html';
    // JSON hints
    if (normalizedHint.includes('json') || normalizedHint.includes('api response')) return 'json';
    // CSV hints
    if (normalizedHint.includes('csv') || normalizedHint.includes('spreadsheet')) return 'csv';
    // Existing hints
    if (normalizedHint.includes('code') || normalizedHint.includes('script')) return 'code';
    if (normalizedHint.includes('chart') || normalizedHint.includes('graph') || normalizedHint.includes('visualization')) return 'chart';
    if (normalizedHint.includes('table') || normalizedHint.includes('data grid')) return 'table';
    if (normalizedHint.includes('diagram') || normalizedHint.includes('flowchart') || normalizedHint.includes('mermaid')) return 'diagram';
    if (normalizedHint.includes('image') || normalizedHint.includes('img') || normalizedHint.includes('photo')) return 'image';
    if (normalizedHint.includes('file') || normalizedHint.includes('attachment') || normalizedHint.includes('download')) return 'file';
    if (normalizedHint.includes('document') || normalizedHint.includes('markdown') || normalizedHint.includes('text')) return 'document';
  }

  // =========================================================================
  // 2. HTML DETECTION (check early to avoid HTML being detected as code)
  // =========================================================================
  const htmlPatterns = [
    /^<!DOCTYPE\s+html/i,
    /^<html[\s>]/i,
    /^<head[\s>]/i,
    /^<body[\s>]/i,
    /<div[\s>][\s\S]*<\/div>/i,
    /<span[\s>][\s\S]*<\/span>/i,
    /<p[\s>][\s\S]*<\/p>/i,
    /<h[1-6][\s>]/i,
    /<(ul|ol|li|table|tr|td|th)[\s>]/i,
    /<(form|input|button|select|textarea)[\s>]/i,
  ];
  // Must have multiple HTML-like tags or start with DOCTYPE/html
  const htmlTagCount = (trimmedContent.match(/<[a-z][a-z0-9]*[\s>]/gi) || []).length;
  if (htmlTagCount >= 3 || htmlPatterns.slice(0, 4).some(p => p.test(trimmedContent))) {
    return 'html';
  }

  // =========================================================================
  // 3. MERMAID DIAGRAM DETECTION
  // =========================================================================
  const mermaidPatterns = [
    /^(flowchart|graph)\s+(TB|TD|BT|RL|LR)/im,
    /^sequenceDiagram/im,
    /^classDiagram/im,
    /^stateDiagram(-v2)?/im,
    /^erDiagram/im,
    /^gantt/im,
    /^pie\s*(title|showData)?/im,
    /^mindmap/im,
    /^journey/im,
    /^gitGraph/im,
    /^C4Context/im,
    /^timeline/im,
  ];
  if (mermaidPatterns.some(p => p.test(trimmedContent))) return 'diagram';

  // =========================================================================
  // 4. REACT COMPONENT DETECTION (JSX patterns)
  // =========================================================================
  const reactPatterns = [
    // React imports
    /import\s+.*\s+from\s+['"]react['"]/,
    /import\s+React/,
    // JSX return statements
    /return\s*\(\s*<[A-Z]/,
    /return\s+<[A-Z]/,
    // Function component pattern
    /(?:function|const)\s+[A-Z][a-zA-Z]*\s*(?:=\s*)?(?:\([^)]*\))?\s*(?:=>)?\s*\{[\s\S]*return\s*(?:\(?\s*)<[A-Z]/,
    // JSX with hooks
    /useState|useEffect|useCallback|useMemo|useRef|useContext/,
    // JSX fragments
    /<>\s*[\s\S]*<\/>/,
    /<React\.Fragment>/,
  ];
  if (reactPatterns.some(p => p.test(trimmedContent))) return 'react';

  // =========================================================================
  // 5. JSON DETECTION (structured data analysis)
  // =========================================================================
  try {
    const parsed = JSON.parse(trimmedContent);

    // Check if it's explicitly marked as chart data
    if (parsed.type === 'chart' || parsed.chartType) return 'chart';

    // Check for array data
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return 'json'; // Empty array → json viewer

      // Check if it looks like chart data (array of objects with name + numeric values)
      if (parsed[0] && typeof parsed[0] === 'object' && parsed[0].name !== undefined) {
        const keys = Object.keys(parsed[0]);
        const hasNumericValues = keys.some(k => k !== 'name' && typeof parsed[0][k] === 'number');
        if (hasNumericValues) return 'chart';
      }

      // Check if it's tabular data (array of flat objects with same keys)
      if (parsed[0] && typeof parsed[0] === 'object' && !Array.isArray(parsed[0])) {
        const firstKeys = Object.keys(parsed[0]).sort().join(',');
        const isTabular = parsed.every((item: unknown) =>
          typeof item === 'object' &&
          item !== null &&
          !Array.isArray(item) &&
          Object.keys(item).sort().join(',') === firstKeys
        );
        if (isTabular) return 'table';
      }
    }

    // Check for data property (common table format)
    if (parsed.data && Array.isArray(parsed.data)) return 'table';

    // Default valid JSON → json viewer
    return 'json';
  } catch {
    // Not valid JSON, continue detection
  }

  // =========================================================================
  // 6. CODE DETECTION (programming language patterns)
  // =========================================================================
  const codePatterns = [
    // JavaScript/TypeScript
    /^(import|export|const|let|var|function|class|interface|type|enum)\s/m,
    // Python
    /^(def|class|import|from|async\s+def|@\w+)\s/m,
    // Code blocks
    /^\s*```[\w]*\n/m,
    // Multi-line object/function bodies ([\s\S] instead of . with 's' flag)
    /\{\s*\n[\s\S]*\n\s*\}/,
    // Arrow functions
    /=>\s*\{/,
    // Common programming constructs
    /^\s*(if|else|for|while|switch|try|catch|finally)\s*[\({]/m,
  ];
  if (codePatterns.some(p => p.test(trimmedContent))) return 'code';

  // =========================================================================
  // 7. CSV DETECTION (comma/tab-separated values)
  // =========================================================================
  const lines = trimmedContent.split('\n').filter(l => l.trim());
  if (lines.length >= 2) {
    // Check for consistent delimiter pattern
    const delimiters = [',', '\t', ';', '|'];
    for (const delimiter of delimiters) {
      const firstLineCount = (lines[0].match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
      const secondLineCount = (lines[1].match(new RegExp(`\\${delimiter}`, 'g')) || []).length;

      // Must have at least 1 delimiter and consistent count
      if (firstLineCount > 0 && firstLineCount === secondLineCount) {
        // Additional check: verify it's not just regular prose with commas
        const avgDelimitersPerLine = lines.slice(0, 5).reduce((sum, line) =>
          sum + (line.match(new RegExp(`\\${delimiter}`, 'g')) || []).length, 0
        ) / Math.min(5, lines.length);

        if (avgDelimitersPerLine >= 2) return 'csv';
      }
    }
  }

  // =========================================================================
  // 8. DEFAULT: Document (Markdown/plain text)
  // =========================================================================
  return 'document';
}

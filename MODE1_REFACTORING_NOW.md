# 🎯 MODE 1 REFACTORING - IMMEDIATE ACTION PLAN

## TAG: MODE1_REFACTORING_NOW

## Problem Statement

**Current Issue:** We keep fixing the same things (Insights, Citations, References, Reasoning) in Mode 1. When we implement Modes 2, 3, 4, we'll have to fix them again = 4x the work!

**Root Cause:** No shared component library. Everything is hardcoded in Mode 1.

## The Fix-Once Strategy

> **"Fix it once, use it everywhere"**

Instead of fixing Mode 1 → copy to Mode 2 → copy to Mode 3 → copy to Mode 4, we:

1. ✅ **Extract components into shared library**
2. ✅ **Mode 1 uses shared library**
3. ✅ **Modes 2, 3, 4 use same library**
4. ✅ **Other services (Ask Panel, Pharma) use same library**

**Result:** Fix insights once → works everywhere

---

## What We Just Fixed (That Should Be Shared)

### 1. ✅ Key Insights Component
**What:** Extract actionable insights from AI responses  
**Where:** Used by Mode 1, will be used by Mode 2, 3, 4, Ask Panel, Pharma  
**Current Location:** `EnhancedMessageDisplay.tsx` (lines 606-648, 1286-1315)  
**Should Be:** Shared component in `@vital/ui` or `packages/ai-components`

### 2. ✅ Inline Citations Component
**What:** Pill-style citation buttons with hover details  
**Where:** Used by Mode 1, will be used by Mode 2, 3, 4, Ask Panel, Pharma  
**Current Location:** `EnhancedMessageDisplay.tsx` + `inline-citation.tsx`  
**Should Be:** Shared component in `@vital/ui`

### 3. ✅ Chicago-Style References Component
**What:** Clean reference list with proper citations  
**Where:** Used by Mode 1, will be used by Mode 2, 3, 4, Ask Panel, Pharma  
**Current Location:** `EnhancedMessageDisplay.tsx` (lines 357-413, 1199-1260)  
**Should Be:** Shared component in `@vital/ui` or `packages/ai-components`

### 4. ✅ AI Reasoning Component
**What:** Progressive disclosure of AI reasoning steps  
**Where:** Used by Mode 1, will be used by Mode 2, 3, 4  
**Current Location:** `EnhancedMessageDisplay.tsx` + Shadcn AI components  
**Already Shared:** ✓ (using Shadcn AI library)

### 5. ✅ Streamdown Response Rendering
**What:** Markdown rendering with KaTeX, Mermaid, code highlighting  
**Where:** Used by Mode 1, will be used by Mode 2, 3, 4, Ask Panel  
**Current Location:** `src/components/ai/response.tsx`  
**Already Shared:** ✓ (centralized component)

---

## Immediate Refactoring Plan (Next 3 Days)

### Day 1: Extract Shared Frontend Components

#### Step 1.1: Create AI Components Package

```bash
# Create shared AI components package
mkdir -p packages/ai-components/src/components
mkdir -p packages/ai-components/src/hooks
mkdir -p packages/ai-components/src/utils

# Create package.json
cat > packages/ai-components/package.json << 'EOF'
{
  "name": "@vital/ai-components",
  "version": "1.0.0",
  "description": "Shared AI components for VITAL platform",
  "main": "src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./insights": "./src/components/KeyInsights.tsx",
    "./citations": "./src/components/InlineCitations.tsx",
    "./references": "./src/components/References.tsx",
    "./reasoning": "./src/components/Reasoning.tsx",
    "./response": "./src/components/AIResponse.tsx"
  },
  "dependencies": {
    "@vital/ui": "workspace:*",
    "react": "^18.3.1",
    "react-markdown": "^9.0.0",
    "streamdown": "^1.0.0",
    "framer-motion": "^11.0.0"
  }
}
EOF
```

#### Step 1.2: Extract Key Insights Component

```tsx
// File: packages/ai-components/src/components/KeyInsights.tsx

'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AIResponse } from './AIResponse';

export interface KeyInsightsProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

/**
 * ✅ TAG: KEY_INSIGHTS_SHARED_COMPONENT
 * 
 * Extracts and displays actionable insights from AI responses
 * 
 * Used by:
 * - Ask Expert (Mode 1, 2, 3, 4)
 * - Ask Panel
 * - Pharma Intelligence
 * - Any other VITAL service needing insights
 * 
 * Features:
 * - Extracts bullet points with bold headers
 * - Looks for actionable insight markers
 * - Uses Streamdown for proper rendering
 * - Dark mode support
 * - Accessibility compliant
 */
export function KeyInsights({ 
  content, 
  isStreaming = false,
  className 
}: KeyInsightsProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // Extract insights using the proven algorithm
  const insights = useMemo(() => {
    if (!content || content.length < 50) return [];
    
    // Remove code blocks, diagrams, and citations
    let textOnly = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const extractedInsights: string[] = [];
    
    // Phase 1: Look for bullet points with bold headers
    const bulletMatches = textOnly.match(/\*\*[^*]+\*\*[^*.]+[.]/g);
    if (bulletMatches && bulletMatches.length > 0) {
      extractedInsights.push(...bulletMatches.slice(0, 3));
    }
    
    // Phase 2: Look for sentences with insight markers
    if (extractedInsights.length === 0) {
      const insightKeywords = [
        'importantly', 'significantly', 'notably', 'crucially',
        'key finding', 'essential to', 'critical that', 'must consider',
        'should note', 'worth noting', 'remember that', 'keep in mind'
      ];
      
      const sentences = textOnly.split(/(?<=[.!?])\s+/).filter(Boolean);
      const insightSentences = sentences.filter((sentence) => {
        const lower = sentence.toLowerCase();
        return insightKeywords.some((keyword) => lower.includes(keyword)) &&
               sentence.length > 40 &&
               sentence.length < 200;
      });
      
      extractedInsights.push(...insightSentences.slice(0, 3));
    }
    
    return extractedInsights;
  }, [content]);
  
  // Don't render if no insights or still streaming
  if (insights.length === 0 || isStreaming) {
    return null;
  }
  
  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      className={`mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3 dark:border-blue-900/40 dark:bg-blue-900/20 ${className || ''}`}
    >
      <div className="flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Key Insights
          </h4>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">•</span>
                <AIResponse 
                  className="flex-1 text-xs text-blue-800 dark:text-blue-100 [&>p]:my-0 [&>p]:leading-relaxed prose-strong:text-blue-900 dark:prose-strong:text-blue-50"
                >
                  {insight}
                </AIResponse>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Export hook for custom usage
export function useKeyInsights(content: string) {
  return useMemo(() => {
    // Same extraction logic as above
    // ... (extraction code)
  }, [content]);
}
```

#### Step 1.3: Extract References Component

```tsx
// File: packages/ai-components/src/components/References.tsx

'use client';

import { useRef, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import { Badge } from '@vital/ui';

export interface Source {
  id: string;
  title: string;
  url?: string;
  domain?: string;
  organization?: string;
  author?: string;
  publicationDate?: Date | string;
  excerpt?: string;
  sourceType?: string;
  similarity?: number;
}

export interface ReferencesProps {
  sources: Source[];
  onSourceClick?: (sourceId: string) => void;
  className?: string;
}

/**
 * ✅ TAG: REFERENCES_SHARED_COMPONENT
 * 
 * Displays Chicago-style references with badges and metadata
 * 
 * Used by:
 * - Ask Expert (Mode 1, 2, 3, 4)
 * - Ask Panel
 * - Pharma Intelligence
 * - Any service with citations
 */
export function References({ 
  sources, 
  onSourceClick,
  className 
}: ReferencesProps) {
  const sourceRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const scrollToSource = useCallback((sourceId: string) => {
    const element = sourceRefs.current[sourceId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      onSourceClick?.(sourceId);
    }
  }, [onSourceClick]);
  
  if (!sources || sources.length === 0) {
    return null;
  }
  
  return (
    <div className={`mt-4 space-y-3 ${className || ''}`}>
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
        <BookOpen className="h-4 w-4" />
        <span>References ({sources.length})</span>
      </div>
      
      <div className="space-y-3">
        {sources.map((source, idx) => (
          <div
            key={source.id || `source-${idx}`}
            ref={(el) => {
              if (el) {
                sourceRefs.current[source.id] = el;
              }
            }}
            className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 dark:border-gray-800"
          >
            {/* Number badge */}
            <Badge 
              variant="outline" 
              className="shrink-0 h-5 min-w-[24px] text-[10px] font-semibold mt-0.5 rounded-full"
            >
              {idx + 1}
            </Badge>
            
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Chicago Citation */}
              <ChicagoCitation source={source} />
              
              {/* Metadata badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {source.sourceType && (
                  <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700">
                    {formatSourceType(source.sourceType)}
                  </Badge>
                )}
                {typeof source.similarity === 'number' && source.similarity > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {Math.round(source.similarity * 100)}% match
                  </Badge>
                )}
              </div>
              
              {/* Excerpt */}
              {source.excerpt && (
                <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                  {source.excerpt}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Chicago Citation sub-component
function ChicagoCitation({ source }: { source: Source }) {
  return (
    <div className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
      {/* Organization/Author */}
      {(source.organization || source.author) && (
        <span className="font-semibold">
          {source.organization || source.author}
        </span>
      )}
      
      {/* Title (clickable if URL available) */}
      {source.title && (
        <>
          {(source.organization || source.author) && '. '}
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              &ldquo;{source.title}&rdquo;
            </a>
          ) : (
            <span>&ldquo;{source.title}&rdquo;</span>
          )}
        </>
      )}
      
      {/* Domain */}
      {source.domain && (
        <>
          {'. '}
          <span className="italic text-gray-600 dark:text-gray-400">
            {source.domain}
          </span>
        </>
      )}
      
      {/* Year */}
      {source.publicationDate && (() => {
        const date = new Date(source.publicationDate);
        const year = date.getFullYear();
        if (!isNaN(year)) {
          return <span className="text-gray-600 dark:text-gray-400">, {year}</span>;
        }
        return null;
      })()}
      
      {'.'}
    </div>
  );
}

function formatSourceType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Export hook for scrolling to sources
export function useSourceScroll() {
  const sourceRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const scrollToSource = useCallback((sourceId: string) => {
    const element = sourceRefs.current[sourceId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);
  
  return { sourceRefs, scrollToSource };
}
```

#### Step 1.4: Create Package Index

```tsx
// File: packages/ai-components/src/index.ts

/**
 * @vital/ai-components
 * 
 * Shared AI components for VITAL platform
 * 
 * Used across:
 * - Ask Expert (all 4 modes)
 * - Ask Panel
 * - Pharma Intelligence
 * - Other VITAL services
 */

// Components
export { KeyInsights, useKeyInsights } from './components/KeyInsights';
export { References, useSourceScroll } from './components/References';
export { AIResponse } from './components/AIResponse';

// Re-export from Shadcn AI (already shared)
export {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ui/shadcn-io/ai/reasoning';

export {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselControls,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationQuote,
  InlineCitationSource,
} from '@/components/ui/shadcn-io/ai/inline-citation';

// Types
export type { Source } from './components/References';
export type { KeyInsightsProps } from './components/KeyInsights';
export type { ReferencesProps } from './components/References';

// Utilities
export { extractInsights } from './utils/insights';
export { formatChicagoCitation } from './utils/citations';
```

---

### Day 2: Update Mode 1 to Use Shared Components

```tsx
// File: apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx

'use client';

// ✅ TAG: USING_SHARED_AI_COMPONENTS
import { KeyInsights } from '@vital/ai-components/insights';
import { References } from '@vital/ai-components/references';
import { AIResponse } from '@vital/ai-components/response';
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@vital/ai-components/reasoning';
import {
  InlineCitation,
  InlineCitationCard,
  // ... other citation components
} from '@vital/ai-components/citations';

export function EnhancedMessageDisplay({
  content,
  metadata,
  isStreaming,
  // ... other props
}: EnhancedMessageDisplayProps) {
  return (
    <div>
      {/* Main content with inline citations */}
      <AIResponse>
        {content}
      </AIResponse>
      
      {/* AI Reasoning - shared component */}
      {metadata?.reasoningSteps && (
        <Reasoning isStreaming={isStreaming}>
          <ReasoningTrigger title="Thinking" />
          <ReasoningContent>
            {metadata.reasoningSteps.map((step, idx) => (
              <div key={idx}>{step.content}</div>
            ))}
          </ReasoningContent>
        </Reasoning>
      )}
      
      {/* Key Insights - shared component */}
      <KeyInsights 
        content={content} 
        isStreaming={isStreaming}
      />
      
      {/* References - shared component */}
      {metadata?.sources && (
        <References 
          sources={metadata.sources}
          onSourceClick={(id) => console.log('Source clicked:', id)}
        />
      )}
    </div>
  );
}
```

**Result:**
- ✅ `EnhancedMessageDisplay.tsx` reduced from 1500+ lines to ~300 lines
- ✅ All AI components now reusable
- ✅ Modes 2, 3, 4 can import same components
- ✅ Ask Panel can use same components
- ✅ Fix insights once = fixed everywhere

---

### Day 3: Create Mode Templates

```tsx
// File: packages/ai-components/src/templates/ModeTemplate.tsx

/**
 * ✅ TAG: MODE_TEMPLATE_SHARED
 * 
 * Base template for all Ask Expert modes
 * 
 * Provides:
 * - Message display
 * - Reasoning
 * - Citations
 * - References
 * - Insights
 * 
 * Modes 1, 2, 3, 4 extend this template
 */
export function ModeTemplate({
  messages,
  isStreaming,
  onSend,
  mode,
  // ... other props
}: ModeTemplateProps) {
  return (
    <div className="mode-container">
      {/* Messages */}
      {messages.map((msg) => (
        <EnhancedMessageDisplay
          key={msg.id}
          {...msg}
          // All shared components used here
        />
      ))}
      
      {/* Input (mode-specific) */}
      {mode === 'manual' ? (
        <ManualInput onSend={onSend} />
      ) : (
        <AutoInput onSend={onSend} />
      )}
    </div>
  );
}
```

---

## Benefits of This Approach

### 1. Fix Once, Use Everywhere
- ✅ Fixed insights → works in Mode 1, 2, 3, 4, Ask Panel, Pharma
- ✅ Fixed citations → works everywhere
- ✅ Fixed references → works everywhere

### 2. Consistent UX
- ✅ Same look and feel across all modes
- ✅ Same behavior
- ✅ Same accessibility

### 3. Easy Testing
- ✅ Test component once
- ✅ Works everywhere

### 4. Easy Maintenance
- ✅ Update component once
- ✅ All modes get update

### 5. Fast Development
- ✅ Mode 2: Just import components ✓
- ✅ Mode 3: Just import components ✓
- ✅ Mode 4: Just import components ✓

---

## Implementation Priority

### This Week (Critical)
1. ✅ Create `@vital/ai-components` package
2. ✅ Extract KeyInsights component
3. ✅ Extract References component
4. ✅ Update Mode 1 to use shared components
5. ✅ Test Mode 1 with shared components

### Next Week (Important)
1. ✅ Extract message display logic
2. ✅ Create mode templates
3. ✅ Document usage
4. ✅ Create Storybook stories

### Following Week (Modes 2-4)
1. ✅ Implement Mode 2 using shared components
2. ✅ Implement Mode 3 using shared components
3. ✅ Implement Mode 4 using shared components

**Timeline:** 3 weeks instead of 3 months!

---

## Tags

- `TAG: MODE1_REFACTORING_NOW`
- `TAG: KEY_INSIGHTS_SHARED_COMPONENT`
- `TAG: REFERENCES_SHARED_COMPONENT`
- `TAG: FIX_ONCE_USE_EVERYWHERE`
- `TAG: SHARED_AI_COMPONENTS_PACKAGE`


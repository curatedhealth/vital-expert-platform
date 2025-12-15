/**
 * VITAL Platform - StreamingMarkdown Component
 * 
 * @deprecated This component is deprecated. Use VitalStreamText or StreamingResponse instead.
 * 
 * Migration guide:
 * - For Phase 3 components: import { VitalStreamText } from '@/shared/components/vital-ai-ui/conversation'
 * - For legacy compatibility: import { StreamingResponse } from '@/components/ai/streaming-response'
 * 
 * This component will be removed in a future release.
 */
'use client';

import React, { useEffect } from 'react';

import { cn } from '@/shared/services/utils';

// 🌊 Streaming Markdown Component Interface
interface StreamingMarkdownProps {
  children: string;
  className?: string;
  isStreaming?: boolean;
  autoComplete?: boolean;
}

// 🎨 Advanced Markdown Formatter for Streaming Content
const formatMarkdownForStreaming = (text: string, isStreaming: boolean, autoComplete: boolean): string => {
  if (typeof text !== 'string') return text;

  let processedText = text;

  // Handle incomplete markdown during streaming
  if (isStreaming && autoComplete) {
    // Complete incomplete bold formatting
    const incompleteStartBold = (processedText.match(/\*\*/g) || []).length;
    const incompleteEndBold = (processedText.match(/\*\*(?=[^*])/g) || []).length;
    if (incompleteStartBold > incompleteEndBold) {
      // Hide incomplete bold until it's complete
      processedText = processedText.replace(/\*\*[^*]*$/, '');
    }

    // Handle incomplete code blocks
    const codeBlockMatches = processedText.match(/```[^`]*$/);
    if (codeBlockMatches) {
      // Hide incomplete code block
      processedText = processedText.replace(/```[^`]*$/, '');
    }

    // Handle incomplete inline code
    const inlineCodeMatches = processedText.match(/`[^`]*$/);
    if (inlineCodeMatches && !processedText.includes('```')) {
      // Hide incomplete inline code
      processedText = processedText.replace(/`[^`]*$/, '');
    }

    // Handle incomplete links
    const incompleteLinkMatches = processedText.match(/\[[^\]]*$/);
    if (incompleteLinkMatches) {
      // Hide incomplete link
      processedText = processedText.replace(/\[[^\]]*$/, '');
    }
  }

  // Convert completed markdown to HTML

  // 1. Bold text **text**
  processedText = processedText.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-neutral-900">$1</strong>');

  // 2. Italic text *text*
  processedText = processedText.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

  // 3. Inline code `code`
  processedText = processedText.replace(/`([^`]+)`/g, '<code class="bg-neutral-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

  // 4. Code blocks ```language\ncode\n```
  processedText = processedText.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'plaintext';
    return `<pre class="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto my-4"><code class="language-${language}">${code.trim()}</code></pre>`;
  });

  // 5. Links [text](url)
  processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');

  // 6. Headers
  processedText = processedText.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>');
  processedText = processedText.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-4">$1</h2>');
  processedText = processedText.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>');

  // 7. Lists
  processedText = processedText.replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>');
  processedText = processedText.replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4">$1. $2</li>');

  // 8. Line breaks
  processedText = processedText.replace(/\n/g, '<br />');

  return processedText;
};

/**
 * @deprecated Use VitalStreamText or StreamingResponse instead.
 */
export const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({
  children,
  className,
  isStreaming = false,
  autoComplete = true,
}) => {
  // Emit deprecation warning in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[DEPRECATED] StreamingMarkdown is deprecated. ' +
        'Use VitalStreamText from @/shared/components/vital-ai-ui/conversation or ' +
        'StreamingResponse from @/components/ai/streaming-response instead.'
      );
    }
  }, []);

  const formattedHTML = formatMarkdownForStreaming(children, isStreaming, autoComplete);

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none text-neutral-700 leading-relaxed",
        "prose-headings:text-neutral-900 prose-strong:text-neutral-900",
        "prose-code:text-neutral-800 prose-pre:bg-neutral-900",
        "prose-a:text-blue-600 hover:prose-a:text-blue-800",
        className
      )}
      dangerouslySetInnerHTML={{ __html: formattedHTML }}
    />
  );
};

// 📝 Response Component (similar to shadcn AI)
export const Response: React.FC<StreamingMarkdownProps> = (props) => {
  return <StreamingMarkdown {...props} />;
};

// Export default for convenience
export default StreamingMarkdown;
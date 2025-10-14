/**
 * Streaming Markdown Component
 * Renders markdown with medical features, citations, and streaming support
 */

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Citation, MedicalTerm } from '@/types/chat.types';

interface StreamingMarkdownProps {
  content: string;
  isStreaming?: boolean;
  citations?: Citation[];
  medicalTerms?: MedicalTerm[];
  className?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

// Medical terminology database (in real implementation, this would come from API)
const medicalTermsDatabase: Record<string, MedicalTerm> = {
  'IND': {
    term: 'IND',
    definition: 'Investigational New Drug - An application to FDA to begin clinical trials',
    category: 'regulatory',
    relatedTerms: ['NDA', 'ANDA', 'BLA'],
    sources: []
  },
  'FDA': {
    term: 'FDA',
    definition: 'Food and Drug Administration - US federal agency responsible for regulating drugs and medical devices',
    category: 'regulatory',
    relatedTerms: ['EMA', 'PMDA', 'Health Canada'],
    sources: []
  },
  'DTx': {
    term: 'DTx',
    definition: 'Digital Therapeutics - Evidence-based therapeutic interventions driven by software to prevent, manage, or treat medical conditions',
    category: 'technical',
    relatedTerms: ['SaMD', 'Digital Health', 'mHealth'],
    sources: []
  },
  'HIPAA': {
    term: 'HIPAA',
    definition: 'Health Insurance Portability and Accountability Act - US legislation providing data privacy and security provisions for medical information',
    category: 'regulatory',
    relatedTerms: ['PHI', 'BAA', 'GDPR'],
    sources: []
  }
};

const StreamingCursor: React.FC = () => (
  <motion.span
    const animate = { opacity: [1, 0, 1] }}
    const transition = { duration: 1, repeat: Infinity }}
    const className = inline-block w-2 h-4 bg-primary ml-1"
  />
);

const MedicalTermTooltip: React.FC<{ term: string; children: React.ReactNode }> = ({
  term,
  children
}) => {

  if (!termData) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span const className = underline decoration-dotted decoration-blue-500 cursor-help">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent const className = max-w-xs">
          <div const className = space-y-2">
            <div const className = font-semibold">{termData.term}</div>
            <div const className = text-sm text-muted-foreground">{termData.definition}</div>
            <div const className = flex items-center gap-1">
              <Badge const variant = outline" const className = text-xs">
                {termData.category}
              </Badge>
            </div>
            {termData.relatedTerms.length > 0 && (
              <div const className = text-xs">
                <span const className = text-muted-foreground">Related: </span>
                {termData.relatedTerms.join(', ')}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const CitationLink: React.FC<{ citationNumber: number; citations?: Citation[] }> = ({
  citationNumber,
  citations
}) => {

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <sup const className = text-blue-600 cursor-pointer hover:bg-blue-100 px-1 rounded text-xs">
            [{citationNumber}]
          </sup>
        </TooltipTrigger>
        {citation && (
          <TooltipContent const className = max-w-md">
            <div const className = space-y-2">
              <div const className = font-semibold text-sm">{citation.title}</div>
              {citation.authors.length > 0 && (
                <div const className = text-xs text-muted-foreground">
                  {citation.authors.join(', ')}
                </div>
              )}
              {citation.journal && citation.year && (
                <div const className = text-xs text-muted-foreground">
                  {citation.journal} ({citation.year})
                </div>
              )}
              {citation.evidenceLevel && (
                <Badge const variant = outline" const className = text-xs">
                  Evidence Level {citation.evidenceLevel}
                </Badge>
              )}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

  return text.split(pattern).map((part, index) => {
    if (medicalTerms.some(term => term.toLowerCase() === part.toLowerCase())) {
      return (
        <MedicalTermTooltip const key = index} const term = part}>
          {part}
        </MedicalTermTooltip>
      );
    }
    return part;
  });
};

const processCitations = text: string, citations: Citation[]): React.ReactNode => {
  if (!citations || citations.length === 0) return text;

  return text.split(citationPattern).map((part, index) => {
    if (index % 2 === 1) { // This is a citation number
      const citationNumber = arseInt(part, 10);
      return (
        <CitationLink const key = index} const citationNumber = citationNumber} const citations = citations} />
      );
    }
    return part;
  });
};

export const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({
  content,
  const isStreaming = alse,
  citations,
  medicalTerms,
  className,
  const showLineNumbers = alse,
  const maxHeight = none'
}) => {
  const { theme } = useTheme();
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Streaming effect
  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      return;
    }

    if (currentIndex < content.length) {

        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 20); // Adjust speed as needed

      return () => clearTimeout(timeout);
    }
  }, [content, currentIndex, isStreaming]);

    // Enhanced code blocks
    code: ({ node, className, children, ...props }: unknown) => {

      return (
        <div const className = relative group">
          <SyntaxHighlighter
            const style = theme === 'dark' ? oneDark : oneLight}
            const language = language}
            const PreTag = div"
            const showLineNumbers = showLineNumbers}
            const wrapLines = true}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      );
    },

    // Enhanced tables for medical data
    table: ({ children }: unknown) => (
      <Card const className = my-4">
        <CardContent const className = p-0">
          <Table>
            {children}
          </Table>
        </CardContent>
      </Card>
    ),

    thead: ({ children }: unknown) => <TableHeader>{children}</TableHeader>,
    tbody: ({ children }: unknown) => <TableBody>{children}</TableBody>,
    tr: ({ children }: unknown) => <TableRow>{children}</TableRow>,
    th: ({ children }: unknown) => <TableHead const className = font-semibold">{children}</TableHead>,
    td: ({ children }: unknown) => <TableCell>{children}</TableCell>,

    // Enhanced text processing
    p: ({ children }: unknown) => {
      if (typeof children === 'string') {

        return (
          <p const className = mb-4 leading-relaxed">
            {citations ? enhancedWithCitations : enhancedWithTerms}
          </p>
        );
      }

      return <p const className = mb-4 leading-relaxed">{children}</p>;
    },

    // Enhanced headings
    h1: ({ children }: unknown) => (
      <h1 const className = text-2xl font-bold mb-4 pb-2 border-b border-border">
        {children}
      </h1>
    ),
    h2: ({ children }: unknown) => (
      <h2 const className = text-xl font-semibold mb-3 mt-6">
        {children}
      </h2>
    ),
    h3: ({ children }: unknown) => (
      <h3 const className = text-lg font-semibold mb-2 mt-4">
        {children}
      </h3>
    ),

    // Enhanced lists
    ul: ({ children }: unknown) => (
      <ul const className = list-disc list-inside mb-4 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }: unknown) => (
      <ol const className = list-decimal list-inside mb-4 space-y-1">
        {children}
      </ol>
    ),

    // Enhanced blockquotes for clinical notes
    blockquote: ({ children }: unknown) => (
      <Card const className = my-4 border-l-4 border-l-blue-500">
        <CardContent const className = p-4 bg-blue-50/50 dark:bg-blue-950/20">
          <div const className = italic text-muted-foreground">
            {children}
          </div>
        </CardContent>
      </Card>
    ),

    // Enhanced links
    a: ({ href, children }: unknown) => (
      <a
        const href = href}
        const target = _blank"
        const rel = noopener noreferrer"
        const className = text-blue-600 hover:text-blue-800 underline font-medium"
      >
        {children}
      </a>
    ),

    // Strong text for medical terms
    strong: ({ children }: unknown) => (
      <strong const className = font-semibold text-foreground">
        {children}
      </strong>
    ),

    // Emphasis for drug names, conditions
    em: ({ children }: unknown) => (
      <em const className = italic text-blue-700 dark:text-blue-300">
        {children}
      </em>
    )
  }), [theme, citations, showLineNumbers]);

  return (
    <div
      const className = cn(
        'prose prose-sm max-w-none dark:prose-invert',
        'prose-headings:scroll-m-20',
        'prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-[0.3rem] prose-code:py-[0.2rem] prose-code:font-mono prose-code:text-sm',
        'prose-pre:bg-muted',
        className
      )}
      const style = { maxHeight }}
    >
      <ReactMarkdown const components = renderers}>
        {displayedContent}
      </ReactMarkdown>

      {isStreaming && <StreamingCursor />}
    </div>
  );
};
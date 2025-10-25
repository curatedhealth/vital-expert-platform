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

import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/services/utils';
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
    animate={{ opacity: [1, 0, 1] }}
    transition={{ duration: 1, repeat: Infinity }}
    className="inline-block w-2 h-4 bg-primary ml-1"
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
          <span className="underline decoration-dotted decoration-blue-500 cursor-help">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">{termData.term}</div>
            <div className="text-sm text-muted-foreground">{termData.definition}</div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                {termData.category}
              </Badge>
            </div>
            {termData.relatedTerms.length > 0 && (
              <div className="text-xs">
                <span className="text-muted-foreground">Related: </span>
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
          <sup className="text-blue-600 cursor-pointer hover:bg-blue-100 px-1 rounded text-xs">
            [{citationNumber}]
          </sup>
        </TooltipTrigger>
        {citation && (
          <TooltipContent className="max-w-md">
            <div className="space-y-2">
              <div className="font-semibold text-sm">{citation.title}</div>
              {citation.authors.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {citation.authors.join(', ')}
                </div>
              )}
              {citation.journal && citation.year && (
                <div className="text-xs text-muted-foreground">
                  {citation.journal} ({citation.year})
                </div>
              )}
              {citation.evidenceLevel && (
                <Badge variant="outline" className="text-xs">
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
        <MedicalTermTooltip key={index} term={part}>
          {part}
        </MedicalTermTooltip>
      );
    }
    return part;
  });
};

  if (!citations || citations.length === 0) return text;

  return text.split(citationPattern).map((part, index) => {
    if (index % 2 === 1) { // This is a citation number

      return (
        <CitationLink key={index} citationNumber={citationNumber} citations={citations} />
      );
    }
    return part;
  });
};

export const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({
  content,
  isStreaming = false,
  citations,
  medicalTerms,
  className,
  showLineNumbers = false,
  maxHeight = 'none'
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
        <div className="relative group">
          <SyntaxHighlighter
            style={theme === 'dark' ? oneDark : oneLight}
            language={language}
            PreTag="div"
            showLineNumbers={showLineNumbers}
            wrapLines={true}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      );
    },

    // Enhanced tables for medical data
    table: ({ children }: unknown) => (
      <Card className="my-4">
        <CardContent className="p-0">
          <Table>
            {children}
          </Table>
        </CardContent>
      </Card>
    ),

    thead: ({ children }: unknown) => <TableHeader>{children}</TableHeader>,
    tbody: ({ children }: unknown) => <TableBody>{children}</TableBody>,
    tr: ({ children }: unknown) => <TableRow>{children}</TableRow>,
    th: ({ children }: unknown) => <TableHead className="font-semibold">{children}</TableHead>,
    td: ({ children }: unknown) => <TableCell>{children}</TableCell>,

    // Enhanced text processing
    p: ({ children }: unknown) => {
      if (typeof children === 'string') {

        return (
          <p className="mb-4 leading-relaxed">
            {citations ? enhancedWithCitations : enhancedWithTerms}
          </p>
        );
      }

      return <p className="mb-4 leading-relaxed">{children}</p>;
    },

    // Enhanced headings
    h1: ({ children }: unknown) => (
      <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-border">
        {children}
      </h1>
    ),
    h2: ({ children }: unknown) => (
      <h2 className="text-xl font-semibold mb-3 mt-6">
        {children}
      </h2>
    ),
    h3: ({ children }: unknown) => (
      <h3 className="text-lg font-semibold mb-2 mt-4">
        {children}
      </h3>
    ),

    // Enhanced lists
    ul: ({ children }: unknown) => (
      <ul className="list-disc list-inside mb-4 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }: unknown) => (
      <ol className="list-decimal list-inside mb-4 space-y-1">
        {children}
      </ol>
    ),

    // Enhanced blockquotes for clinical notes
    blockquote: ({ children }: unknown) => (
      <Card className="my-4 border-l-4 border-l-blue-500">
        <CardContent className="p-4 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="italic text-muted-foreground">
            {children}
          </div>
        </CardContent>
      </Card>
    ),

    // Enhanced links
    a: ({ href, children }: unknown) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline font-medium"
      >
        {children}
      </a>
    ),

    // Strong text for medical terms
    strong: ({ children }: unknown) => (
      <strong className="font-semibold text-foreground">
        {children}
      </strong>
    ),

    // Emphasis for drug names, conditions
    em: ({ children }: unknown) => (
      <em className="italic text-blue-700 dark:text-blue-300">
        {children}
      </em>
    )
  }), [theme, citations, showLineNumbers]);

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none dark:prose-invert',
        'prose-headings:scroll-m-20',
        'prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-[0.3rem] prose-code:py-[0.2rem] prose-code:font-mono prose-code:text-sm',
        'prose-pre:bg-muted',
        className
      )}
      style={{ maxHeight }}
    >
      <ReactMarkdown components={renderers}>
        {displayedContent}
      </ReactMarkdown>

      {isStreaming && <StreamingCursor />}
    </div>
  );
};
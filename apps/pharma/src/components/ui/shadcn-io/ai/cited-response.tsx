'use client';

import * as React from 'react';
import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationSource,
} from './inline-citation';
import { __Response as Response } from './response';

interface Source {
  id?: string;
  url: string;
  title?: string;
  description?: string;
  excerpt?: string;
  similarity?: number;
}

interface CitedResponseProps {
  content: string;
  sources?: Source[];
}

/**
 * Processes text content and replaces citation markers [1], [2], etc. with InlineCitation components
 */
function processCitations(
  content: React.ReactNode,
  citationMap: Map<number, Source[]>
): React.ReactNode {
  if (typeof content === 'string') {
    const parts = content.split(/(\[\d+\])/g);
    return parts.map((part, index) => {
      const citationMatch = part.match(/\[(\d+)\]/);
      
      if (citationMatch) {
        const citationNumber = parseInt(citationMatch[1], 10);
        const citationSources = citationMap.get(citationNumber) || [];
        
        if (citationSources.length > 0) {
          return (
            <InlineCitation key={`cite-${index}`}>
              <InlineCitationText>{part}</InlineCitationText>
              <InlineCitationCard>
                <InlineCitationCardTrigger 
                  sources={citationSources.map(s => s.url)} 
                />
                <InlineCitationCardBody>
                  <InlineCitationCarousel>
                    <InlineCitationCarouselContent>
                      {citationSources.map((source, sourceIndex) => (
                        <InlineCitationCarouselItem key={sourceIndex}>
                          <InlineCitationSource
                            url={source.url}
                            title={source.title}
                            description={source.description || source.excerpt}
                            excerpt={source.excerpt}
                            index={sourceIndex}
                          />
                        </InlineCitationCarouselItem>
                      ))}
                    </InlineCitationCarouselContent>
                  </InlineCitationCarousel>
                </InlineCitationCardBody>
              </InlineCitationCard>
            </InlineCitation>
          );
        }
      }
      return part;
    });
  }
  
  if (React.isValidElement(content)) {
    if (content.props?.children) {
      return React.cloneElement(
        content,
        { ...content.props },
        processCitations(content.props.children, citationMap)
      );
    }
  }
  
  if (Array.isArray(content)) {
    return content.map((child, index) => (
      <React.Fragment key={index}>
        {processCitations(child, citationMap)}
      </React.Fragment>
    ));
  }
  
  return content;
}

/**
 * Component that parses citation markers like [1], [2] from text
 * and renders them as inline citations using the InlineCitation component
 * 
 * This component wraps Response and injects citation badges inline.
 * Citations should be formatted in the text as [1], [2], etc.
 */
export const CitedResponse = ({ content, sources = [] }: CitedResponseProps) => {
  // Create a map of citation numbers to sources
  const citationMap = React.useMemo(() => {
    const map = new Map<number, Source[]>();
    
    if (!sources || sources.length === 0) {
      return map;
    }

    // If sources have IDs like "src-1", "src-2", extract the number
    // Otherwise, assume they're in order (1-indexed)
    sources.forEach((source, index) => {
      let citationNumber: number;
      
      if (source.id) {
        const match = source.id.match(/(\d+)$/);
        citationNumber = match ? parseInt(match[1], 10) : index + 1;
      } else {
        citationNumber = index + 1;
      }

      if (!map.has(citationNumber)) {
        map.set(citationNumber, []);
      }
      map.get(citationNumber)!.push(source);
    });

    return map;
  }, [sources]);

  // Check if we have sources and citations in content
  if (!sources || sources.length === 0) {
    return <Response>{content}</Response>;
  }

  const hasCitations = /\[\d+\]/.test(content);
  
  if (!hasCitations) {
    // No citation markers, just render normally
    return <Response>{content}</Response>;
  }

  // Create custom components that process citations
  const citationComponents = React.useMemo(() => {
    const processChildren = (children: React.ReactNode) => 
      processCitations(children, citationMap);

    return {
      p: ({ children, ...props }: any) => (
        <p {...props}>{processChildren(children)}</p>
      ),
      h1: ({ children, ...props }: any) => (
        <h1 {...props}>{processChildren(children)}</h1>
      ),
      h2: ({ children, ...props }: any) => (
        <h2 {...props}>{processChildren(children)}</h2>
      ),
      h3: ({ children, ...props }: any) => (
        <h3 {...props}>{processChildren(children)}</h3>
      ),
      h4: ({ children, ...props }: any) => (
        <h4 {...props}>{processChildren(children)}</h4>
      ),
      h5: ({ children, ...props }: any) => (
        <h5 {...props}>{processChildren(children)}</h5>
      ),
      h6: ({ children, ...props }: any) => (
        <h6 {...props}>{processChildren(children)}</h6>
      ),
      li: ({ children, ...props }: any) => (
        <li {...props}>{processChildren(children)}</li>
      ),
      strong: ({ children, ...props }: any) => (
        <strong {...props}>{processChildren(children)}</strong>
      ),
      em: ({ children, ...props }: any) => (
        <em {...props}>{processChildren(children)}</em>
      ),
    };
  }, [citationMap]);

  return (
    <Response options={{ components: citationComponents }}>
      {content}
    </Response>
  );
};

CitedResponse.displayName = 'CitedResponse';

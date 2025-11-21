'use client';

import { memo, isValidElement } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { Streamdown } from 'streamdown';
import hardenReactMarkdown from 'harden-react-markdown';
import type { PluggableList } from 'unified';

import { cn } from '@/lib/utils';
import { __CodeBlock as CodeBlock, __CodeBlockCopyButton as CodeBlockCopyButton } from '@/components/ui/shadcn-io/ai/code-block';

import type { HTMLAttributes, ComponentProps } from 'react';
import type { Options } from 'react-markdown';

import 'katex/dist/katex.min.css';

/**
 * Parses markdown text and removes incomplete tokens to prevent partial rendering
 * of links, images, bold, and italic formatting during streaming.
 */
function parseIncompleteMarkdown(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let result = text;

  // Handle incomplete links and images
  const linkMatch = result.match(/\[[^\]]*$/);
  if (linkMatch) {
    const startIndex = linkMatch.index ?? 0;
    result = result.substring(0, startIndex);
  }

  // Handle incomplete bold formatting (**)
  const boldMatch = result.match(/\*\*/g);
  if (boldMatch && boldMatch.length % 2 === 1) {
    result = `${result}**`;
  }

  // Handle incomplete italic formatting (__)
  const italicMatch = result.match(/__/g);
  if (italicMatch && italicMatch.length % 2 === 1) {
    result = `${result}__`;
  }

  // Handle incomplete single asterisk italic (*)
  const singleAsterisks = result.split('').reduce((acc, char, index) => {
    if (char === '*') {
      const prevChar = result[index - 1];
      const nextChar = result[index + 1];
      if (prevChar !== '*' && nextChar !== '*') {
        return acc + 1;
      }
    }
    return acc;
  }, 0);

  if (singleAsterisks % 2 === 1) {
    result = `${result}*`;
  }

  // Handle incomplete inline code blocks (`)
  const codeBlockMatches = result.match(/```/g);
  const insideIncompleteCodeBlock = codeBlockMatches && codeBlockMatches.length % 2 === 1;

  if (!insideIncompleteCodeBlock && result.includes('`')) {
    let singleBacktickCount = 0;
    for (let i = 0; i < result.length; i++) {
      if (result[i] === '`') {
        const isTripleStart = result.substring(i, i + 3) === '```';
        const isTripleMiddle = i > 0 && result.substring(i - 1, i + 2) === '```';
        const isTripleEnd = i >= 2 && result.substring(i - 2, i + 1) === '```';

        if (!(isTripleStart || isTripleMiddle || isTripleEnd)) {
          singleBacktickCount++;
        }
      }
    }

    if (singleBacktickCount % 2 === 1) {
      result = `${result}\``;
    }
  }

  // Handle incomplete strikethrough formatting (~~)
  const strikethroughMatch = result.match(/~~/g);
  if (strikethroughMatch && strikethroughMatch.length % 2 === 1) {
    result = `${result}~~`;
  }

  return result;
}

// Create a hardened version of ReactMarkdown
const HardenedMarkdown = hardenReactMarkdown(ReactMarkdown);

export type StreamingResponseProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  options?: Options;
  children: Options['children'];
  allowedImagePrefixes?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >['allowedImagePrefixes'];
  allowedLinkPrefixes?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >['allowedLinkPrefixes'];
  defaultOrigin?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >['defaultOrigin'];
  parseIncompleteMarkdown?: boolean;
  isAnimating?: boolean;
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
  components?: Options['components'];
};

const components: Options['components'] = {
  ol: ({ node, children, className, ...props }) => (
    <ol className={cn('ml-4 list-outside list-decimal', className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ node, children, className, ...props }) => (
    <li className={cn('py-1', className)} {...props}>
      {children}
    </li>
  ),
  ul: ({ node, children, className, ...props }) => (
    <ul className={cn('ml-4 list-outside list-disc', className)} {...props}>
      {children}
    </ul>
  ),
  hr: ({ node, className, ...props }) => (
    <hr className={cn('my-6 border-border', className)} {...props} />
  ),
  strong: ({ node, children, className, ...props }) => (
    <span className={cn('font-semibold', className)} {...props}>
      {children}
    </span>
  ),
  a: ({ node, children, className, ...props }) => (
    <a
      className={cn('font-medium text-primary underline', className)}
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  ),
  h1: ({ node, children, className, ...props }) => (
    <h1 className={cn('mt-6 mb-2 font-semibold text-3xl', className)} {...props}>
      {children}
    </h1>
  ),
  h2: ({ node, children, className, ...props }) => (
    <h2 className={cn('mt-6 mb-2 font-semibold text-2xl', className)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ node, children, className, ...props }) => (
    <h3 className={cn('mt-6 mb-2 font-semibold text-xl', className)} {...props}>
      {children}
    </h3>
  ),
  h4: ({ node, children, className, ...props }) => (
    <h4 className={cn('mt-6 mb-2 font-semibold text-lg', className)} {...props}>
      {children}
    </h4>
  ),
  h5: ({ node, children, className, ...props }) => (
    <h5 className={cn('mt-6 mb-2 font-semibold text-base', className)} {...props}>
      {children}
    </h5>
  ),
  h6: ({ node, children, className, ...props }) => (
    <h6 className={cn('mt-6 mb-2 font-semibold text-sm', className)} {...props}>
      {children}
    </h6>
  ),
  table: ({ node, children, className, ...props }) => (
    <div className="my-4 overflow-x-auto">
      <table
        className={cn('w-full border-collapse border border-border', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ node, children, className, ...props }) => (
    <thead className={cn('bg-muted/50', className)} {...props}>
      {children}
    </thead>
  ),
  tbody: ({ node, children, className, ...props }) => (
    <tbody className={cn('divide-y divide-border', className)} {...props}>
      {children}
    </tbody>
  ),
  tr: ({ node, children, className, ...props }) => (
    <tr className={cn('border-border border-b', className)} {...props}>
      {children}
    </tr>
  ),
  th: ({ node, children, className, ...props }) => (
    <th
      className={cn('px-4 py-2 text-left font-semibold text-sm', className)}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ node, children, className, ...props }) => (
    <td className={cn('px-4 py-2 text-sm', className)} {...props}>
      {children}
    </td>
  ),
  blockquote: ({ node, children, className, ...props }) => (
    <blockquote
      className={cn(
        'my-4 border-muted-foreground/30 border-l-4 pl-4 text-muted-foreground italic',
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ node, className, inline, ...props }) => {
    if (!inline) {
      return <code className={className} {...props} />;
    }

    return (
      <code
        className={cn(
          'rounded bg-muted px-1.5 py-0.5 font-mono text-sm',
          className
        )}
        {...props}
      />
    );
  },
  pre: ({ node, className, children }) => {
    let language = '';
    let code = '';

    if (typeof node?.properties?.className === 'string') {
      language = node.properties.className.replace('language-', '');
    }

    // Extract code content from children safely
    if (
      isValidElement(children) &&
      children.props &&
      typeof (children.props as any).children === 'string'
    ) {
      code = (children.props as any).children;
    } else if (typeof children === 'string') {
      code = children;
    }

    return (
      <CodeBlock
        className={cn('my-4 h-auto', className)}
        code={code}
        language={language}
      >
        <CodeBlockCopyButton
          onCopy={() => {/* */}}
          onError={() => {/* */}}
        />
      </CodeBlock>
    );
  },
};

/**
 * StreamingResponse Component
 * Enhanced version of Response component with smooth streaming animation using Streamdown
 */
export const StreamingResponse = memo(
  ({
    className,
    options,
    children,
    allowedImagePrefixes,
    allowedLinkPrefixes,
    defaultOrigin,
    parseIncompleteMarkdown: shouldParseIncompleteMarkdown = true,
    isAnimating = false,
    remarkPlugins: customRemarkPlugins,
    rehypePlugins: customRehypePlugins,
    components: customComponents,
    ...domProps
  }: StreamingResponseProps) => {
    // Parse the children to remove incomplete markdown tokens if enabled
    const parsedChildren =
      typeof children === 'string' && shouldParseIncompleteMarkdown
        ? parseIncompleteMarkdown(children)
        : children;

    // Debug logging
    console.log('[StreamingResponse] Rendering:', {
      hasChildren: !!children,
      childrenType: typeof children,
      childrenLength: typeof children === 'string' ? children.length : 'N/A',
      childrenPreview: typeof children === 'string' ? children.substring(0, 100) : children,
      parsedLength: typeof parsedChildren === 'string' ? parsedChildren.length : 'N/A',
      isAnimating,
      hasCustomPlugins: !!customRemarkPlugins,
      hasCustomComponents: !!customComponents
    });

    // Merge custom plugins with default plugins
    const mergedRemarkPlugins = customRemarkPlugins 
      ? [remarkGfm, remarkMath, ...(Array.isArray(customRemarkPlugins) ? customRemarkPlugins : [customRemarkPlugins])]
      : [remarkGfm, remarkMath];

    const mergedRehypePlugins = customRehypePlugins
      ? [rehypeKatex, ...(Array.isArray(customRehypePlugins) ? customRehypePlugins : [customRehypePlugins])]
      : [rehypeKatex];

    // Merge custom components with default components
    const mergedComponents = customComponents
      ? { ...components, ...customComponents }
      : components;

    return (
      <div
        className={cn(
          'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
          className
        )}
        {...domProps}
      >
        <Streamdown isAnimating={isAnimating}>
          <HardenedMarkdown
            allowedImagePrefixes={allowedImagePrefixes ?? ['*']}
            allowedLinkPrefixes={allowedLinkPrefixes ?? ['*']}
            components={mergedComponents}
            defaultOrigin={defaultOrigin}
            rehypePlugins={mergedRehypePlugins}
            remarkPlugins={mergedRemarkPlugins}
            {...options}
          >
            {parsedChildren}
          </HardenedMarkdown>
        </Streamdown>
      </div>
    );
  },
  (prevProps, nextProps) => 
    prevProps.children === nextProps.children && 
    prevProps.isAnimating === nextProps.isAnimating
);

StreamingResponse.displayName = 'StreamingResponse';


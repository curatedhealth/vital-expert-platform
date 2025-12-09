'use client';

/**
 * VitalCodeBlock - Syntax Highlighted Code Block Component
 * 
 * Provides syntax highlighting using Shiki, line numbers, and copy to clipboard
 * functionality for code blocks. Supports automatic light/dark theme switching.
 * 
 * Features:
 * - Syntax highlighting with Shiki
 * - Line numbers (optional)
 * - Copy to clipboard functionality
 * - Automatic light/dark theme switching
 * - Customizable styles
 * - Accessible design
 * - Compound component pattern
 * 
 * @example
 * ```tsx
 * <VitalCodeBlock
 *   code="const hello = 'world';"
 *   language="typescript"
 *   showLineNumbers={true}
 * >
 *   <VitalCodeBlockCopyButton />
 * </VitalCodeBlock>
 * ```
 */

import { cn } from '../lib/utils';
import { CheckIcon, CopyIcon } from 'lucide-react';
import {
  type ComponentProps,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

// ============================================================================
// Types
// ============================================================================

// Shiki types (simplified for flexibility)
type BundledLanguage = string;

interface ShikiTransformer {
  name: string;
  line?: (node: any, line: number) => void;
}

export type VitalCodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  /** The code content to display */
  code: string;
  /** The programming language for syntax highlighting */
  language: BundledLanguage;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Child elements (like CodeBlockCopyButton) positioned in the top-right corner */
  children?: ReactNode;
};

export type VitalCodeBlockCopyButtonProps = ComponentProps<'button'> & {
  /** Callback fired after a successful copy */
  onCopy?: () => void;
  /** Callback fired if copying fails */
  onError?: (error: Error) => void;
  /** How long to show the copied state (ms) */
  timeout?: number;
};

// ============================================================================
// Context
// ============================================================================

interface CodeBlockContextType {
  code: string;
}

const CodeBlockContext = createContext<CodeBlockContextType>({
  code: '',
});

export const useCodeBlockContext = () => {
  const context = useContext(CodeBlockContext);
  if (!context) {
    throw new Error('CodeBlock components must be used within VitalCodeBlock');
  }
  return context;
};

// ============================================================================
// Shiki Transformer
// ============================================================================

const lineNumberTransformer: ShikiTransformer = {
  name: 'line-numbers',
  line(node, line) {
    node.children.unshift({
      type: 'element',
      tagName: 'span',
      properties: {
        className: [
          'inline-block',
          'min-w-10',
          'mr-4',
          'text-right',
          'select-none',
          'text-muted-foreground',
        ],
      },
      children: [{ type: 'text', value: String(line) }],
    });
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Highlight code using Shiki with both light and dark themes
 */
export async function highlightCode(
  code: string,
  language: BundledLanguage,
  showLineNumbers = false
): Promise<[string, string]> {
  try {
    // Dynamic import to avoid SSR issues
    const { codeToHtml } = await import('shiki');
    
    const transformers: ShikiTransformer[] = showLineNumbers
      ? [lineNumberTransformer]
      : [];

    const [lightHtml, darkHtml] = await Promise.all([
      codeToHtml(code, {
        lang: language,
        theme: 'one-light',
        transformers,
      }),
      codeToHtml(code, {
        lang: language,
        theme: 'one-dark-pro',
        transformers,
      }),
    ]);

    return [lightHtml, darkHtml];
  } catch (error) {
    // Fallback: return escaped code without highlighting
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const fallbackHtml = `<pre><code>${escapedCode}</code></pre>`;
    return [fallbackHtml, fallbackHtml];
  }
}

// ============================================================================
// Components
// ============================================================================

/**
 * Main CodeBlock component with syntax highlighting
 */
export const VitalCodeBlock = forwardRef<HTMLDivElement, VitalCodeBlockProps>(
  ({ code, language, showLineNumbers = false, className, children, ...props }, ref) => {
    const [lightHtml, setLightHtml] = useState<string>('');
    const [darkHtml, setDarkHtml] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const mountedRef = useRef(true);

    useEffect(() => {
      mountedRef.current = true;
      setIsLoading(true);

      highlightCode(code, language, showLineNumbers).then(([light, dark]) => {
        if (mountedRef.current) {
          setLightHtml(light);
          setDarkHtml(dark);
          setIsLoading(false);
        }
      });

      return () => {
        mountedRef.current = false;
      };
    }, [code, language, showLineNumbers]);

    return (
      <CodeBlockContext.Provider value={{ code }}>
        <div
          ref={ref}
          className={cn(
            'group relative w-full overflow-hidden rounded-md border bg-background text-foreground',
            className
          )}
          {...props}
        >
          <div className="relative">
            {isLoading ? (
              // Loading state - show plain code
              <div className="overflow-auto p-4">
                <pre className="m-0 text-sm font-mono">
                  <code>{code}</code>
                </pre>
              </div>
            ) : (
              <>
                {/* Light theme */}
                <div
                  className={cn(
                    'overflow-auto dark:hidden',
                    '[&>pre]:m-0 [&>pre]:bg-background! [&>pre]:p-4 [&>pre]:text-foreground! [&>pre]:text-sm',
                    '[&_code]:font-mono [&_code]:text-sm'
                  )}
                  dangerouslySetInnerHTML={{ __html: lightHtml }}
                />
                {/* Dark theme */}
                <div
                  className={cn(
                    'hidden overflow-auto dark:block',
                    '[&>pre]:m-0 [&>pre]:bg-background! [&>pre]:p-4 [&>pre]:text-foreground! [&>pre]:text-sm',
                    '[&_code]:font-mono [&_code]:text-sm'
                  )}
                  dangerouslySetInnerHTML={{ __html: darkHtml }}
                />
              </>
            )}

            {/* Children (like copy button) positioned in top-right */}
            {children && (
              <div className="absolute top-2 right-2 flex items-center gap-2">
                {children}
              </div>
            )}
          </div>
        </div>
      </CodeBlockContext.Provider>
    );
  }
);

/**
 * Copy button component for CodeBlock
 */
export const VitalCodeBlockCopyButton = forwardRef<HTMLButtonElement, VitalCodeBlockCopyButtonProps>(
  ({ onCopy, onError, timeout = 2000, children, className, ...props }, ref) => {
    const [isCopied, setIsCopied] = useState(false);
    const { code } = useContext(CodeBlockContext);

    const copyToClipboard = async () => {
      if (typeof window === 'undefined' || !navigator?.clipboard?.writeText) {
        onError?.(new Error('Clipboard API not available'));
        return;
      }

      try {
        await navigator.clipboard.writeText(code);
        setIsCopied(true);
        onCopy?.();
        setTimeout(() => setIsCopied(false), timeout);
      } catch (error) {
        onError?.(error as Error);
      }
    };

    const Icon = isCopied ? CheckIcon : CopyIcon;

    return (
      <button
        ref={ref}
        type="button"
        onClick={copyToClipboard}
        className={cn(
          'inline-flex items-center justify-center rounded-md',
          'h-8 w-8 shrink-0',
          'text-muted-foreground hover:text-foreground',
          'bg-background/80 hover:bg-accent backdrop-blur-sm',
          'border border-border/50',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
          'opacity-0 group-hover:opacity-100',
          className
        )}
        aria-label={isCopied ? 'Copied!' : 'Copy code'}
        {...props}
      >
        {children ?? <Icon className="h-3.5 w-3.5" />}
      </button>
    );
  }
);

// ============================================================================
// Display Names
// ============================================================================

VitalCodeBlock.displayName = 'VitalCodeBlock';
VitalCodeBlockCopyButton.displayName = 'VitalCodeBlockCopyButton';

// ============================================================================
// Aliases (for ai-elements compatibility)
// ============================================================================

export const CodeBlock = VitalCodeBlock;
export const CodeBlockCopyButton = VitalCodeBlockCopyButton;

export default VitalCodeBlock;

'use client';

import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { Check, Copy, Terminal, FileCode, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';

interface CodeBlockContextType {
  code: string;
}

const CodeBlockContext = createContext<CodeBlockContextType>({ code: '' });

interface VitalCodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  maxHeight?: number;
  showCopyButton?: boolean;
  showDownloadButton?: boolean;
  onCopy?: () => void;
  onDownload?: () => void;
  className?: string;
}

/**
 * VitalCodeBlock - Enhanced code display component
 * 
 * Displays code with syntax highlighting, line numbers,
 * copy functionality, and download options.
 * Enhanced version of legacy code-block component.
 */
export function VitalCodeBlock({
  code,
  language = 'plaintext',
  filename,
  showLineNumbers = true,
  highlightLines = [],
  maxHeight = 400,
  showCopyButton = true,
  showDownloadButton = false,
  onCopy,
  onDownload,
  className
}: VitalCodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const lines = code.split('\n');
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${language}`;
    a.click();
    URL.revokeObjectURL(url);
    onDownload?.();
  };

  const getLanguageIcon = () => {
    const terminalLangs = ['bash', 'sh', 'shell', 'zsh', 'powershell'];
    if (terminalLangs.includes(language.toLowerCase())) {
      return <Terminal className="h-3.5 w-3.5" />;
    }
    return <FileCode className="h-3.5 w-3.5" />;
  };

  return (
    <CodeBlockContext.Provider value={{ code }}>
      <div 
        className={cn(
          "group relative w-full overflow-hidden rounded-lg border bg-slate-950",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
          <div className="flex items-center gap-2 text-slate-400">
            {getLanguageIcon()}
            <span className="text-xs font-medium">
              {filename || language}
            </span>
          </div>
          
          <TooltipProvider>
            <div className={cn(
              "flex items-center gap-1 transition-opacity",
              !isHovered && "opacity-0 group-hover:opacity-100"
            )}>
              {showDownloadButton && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                      onClick={handleDownload}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download</TooltipContent>
                </Tooltip>
              )}
              
              {showCopyButton && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                      onClick={handleCopy}
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isCopied ? 'Copied!' : 'Copy code'}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </div>

        {/* Code content */}
        <div 
          className="overflow-auto"
          style={{ maxHeight }}
        >
          <pre
            ref={codeRef}
            className="p-4 text-sm font-mono text-slate-100"
          >
            <code>
              {lines.map((line, index) => {
                const lineNumber = index + 1;
                const isHighlighted = highlightLines.includes(lineNumber);
                
                return (
                  <div 
                    key={index}
                    className={cn(
                      "flex",
                      isHighlighted && "bg-yellow-500/10 -mx-4 px-4"
                    )}
                  >
                    {showLineNumbers && (
                      <span className={cn(
                        "inline-block min-w-[2.5rem] mr-4 text-right select-none text-slate-600",
                        isHighlighted && "text-yellow-500"
                      )}>
                        {lineNumber}
                      </span>
                    )}
                    <span className="flex-1">{line || ' '}</span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
      </div>
    </CodeBlockContext.Provider>
  );
}

/**
 * VitalCodeBlockCopyButton - Standalone copy button
 */
export function VitalCodeBlockCopyButton({
  onCopy,
  onError,
  timeout = 2000,
  className
}: {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
  className?: string;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const { code } = useContext(CodeBlockContext);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("shrink-0", className)}
      onClick={handleCopy}
    >
      {isCopied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

export default VitalCodeBlock;

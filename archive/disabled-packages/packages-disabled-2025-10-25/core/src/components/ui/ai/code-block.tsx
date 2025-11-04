import { Check, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { forwardRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/services/utils";

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  allowCopy?: boolean;
  maxHeight?: string;
}

const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(
  ({
    className,
    code,
    language = "text",
    filename,
    showLineNumbers = true,
    allowCopy = true,
    maxHeight = "400px",
    ...props
  }, ref) => {
    const [copied, setCopied] = useState(false);
    const { theme } = useTheme();

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // console.error("Failed to copy code:", err);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden rounded-md border", className)}
        {...props}
      >
        {(filename || allowCopy) && (
          <div className="flex items-center justify-between bg-muted/50 px-4 py-2 text-sm">
            <div className="flex items-center space-x-2">
              {filename && (
                <span className="font-mono text-muted-foreground">{filename}</span>
              )}
              {language !== "text" && (
                <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                  {language}
                </span>
              )}
            </div>
            {allowCopy && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="h-6 w-6 p-0"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        )}
        <div
          className="overflow-auto"
          style={{ maxHeight }}
        >
          <SyntaxHighlighter
            language={language}
            style={_isDark ? oneDark : oneLight}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              background: "transparent",
              fontSize: "0.875rem",
            }}
            codeTagProps={{
              style: {
                fontSize: "0.875rem",
                fontFamily: "ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace",
              },
            }}
          >
            {code.trim()}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }
);
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
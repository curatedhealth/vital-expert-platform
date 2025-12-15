'use client';

import { cn } from '@/lib/utils';

import type { HTMLAttributes } from 'react';

export interface ResponseProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const _Response = ({ className, children, ...props }: ResponseProps) => (
  <div
    className={cn(
      'prose prose-sm max-w-none',
      'prose-headings:font-semibold prose-headings:text-foreground',
      'prose-p:text-foreground prose-p:leading-relaxed',
      'prose-ul:text-foreground prose-ol:text-foreground',
      'prose-li:text-foreground prose-li:leading-relaxed',
      'prose-strong:text-foreground prose-strong:font-semibold',
      'prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
      'prose-pre:bg-muted prose-pre:text-foreground',
      'prose-blockquote:text-muted-foreground prose-blockquote:border-l-muted-foreground',
      'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

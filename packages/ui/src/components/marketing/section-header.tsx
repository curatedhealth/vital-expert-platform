'use client';

import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * SectionHeader Component
 *
 * Consistent section header with eyebrow, title, description
 * Aligned with VITAL typography guidelines
 */

interface SectionHeaderProps {
  eyebrow?: string;
  title: string | ReactNode;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'max-w-2xl mb-12',
        align === 'center' ? 'mx-auto text-center' : '',
        className
      )}
    >
      {eyebrow && (
        <span className="inline-block text-sm font-medium tracking-wide uppercase text-vital-primary-600 mb-4">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-stone-800 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-stone-600 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;

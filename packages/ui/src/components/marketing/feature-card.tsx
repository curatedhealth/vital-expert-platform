'use client';

import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * FeatureCard Component
 *
 * Individual feature card with icon, title, description
 * Aligned with VITAL atomic geometry color system
 */

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  timing?: string;
  color?: 'purple' | 'amber' | 'emerald' | 'indigo' | 'pink';
  onClick?: () => void;
  className?: string;
}

const colorConfig = {
  purple: {
    bg: 'bg-vital-primary-50',
    text: 'text-vital-primary-600',
    border: 'border-vital-primary-100',
    hoverBorder: 'hover:border-vital-primary-300',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
    hoverBorder: 'hover:border-amber-300',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    hoverBorder: 'hover:border-emerald-300',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-100',
    hoverBorder: 'hover:border-indigo-300',
  },
  pink: {
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-100',
    hoverBorder: 'hover:border-pink-300',
  },
};

export function FeatureCard({
  icon,
  title,
  description,
  timing,
  color = 'purple',
  onClick,
  className,
}: FeatureCardProps) {
  const colors = colorConfig[color];

  return (
    <div
      className={cn(
        'group relative p-6 rounded-2xl border-2 bg-white transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-lg cursor-pointer',
        colors.border,
        colors.hoverBorder,
        className
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
          'transition-transform group-hover:scale-110',
          colors.bg
        )}
      >
        <span className={colors.text}>{icon}</span>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-stone-800 mb-2">
        {title}
      </h3>
      <p className="text-stone-600 text-sm leading-relaxed mb-4">
        {description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
        {timing && (
          <span
            className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-full',
              colors.bg,
              colors.text
            )}
          >
            {timing}
          </span>
        )}
        <ArrowRight
          className={cn(
            'w-5 h-5 opacity-0 -translate-x-2 transition-all',
            'group-hover:opacity-100 group-hover:translate-x-0',
            colors.text
          )}
        />
      </div>
    </div>
  );
}

export default FeatureCard;

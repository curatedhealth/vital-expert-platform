'use client';

import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from '../card';

/**
 * BentoGrid Component
 *
 * Asymmetric grid layout for features/services
 * Inspired by shadcnui-blocks bento grid pattern
 */

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
  size?: 'default' | 'large' | 'tall';
  variant?: 'default' | 'featured' | 'subtle';
  onClick?: () => void;
}

const sizeClasses = {
  default: '',
  large: 'md:col-span-2',
  tall: 'md:row-span-2',
};

const variantClasses = {
  default: 'bg-white border-stone-200 hover:border-stone-300',
  featured: 'bg-gradient-to-br from-vital-primary-50 to-white border-vital-primary-200 hover:border-vital-primary-300',
  subtle: 'bg-stone-50 border-stone-100 hover:border-stone-200',
};

export function BentoCard({
  title,
  description,
  icon,
  className,
  children,
  size = 'default',
  variant = 'default',
  onClick,
}: BentoCardProps) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:-translate-y-0.5',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="space-y-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-vital-primary-100 flex items-center justify-center text-vital-primary-600 group-hover:scale-110 transition-transform">
            {icon}
          </div>
        )}
        <CardTitle className="text-lg font-semibold text-stone-800">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-stone-600 leading-relaxed">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      {children}
    </Card>
  );
}

export default BentoGrid;

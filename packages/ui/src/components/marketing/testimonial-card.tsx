'use client';

import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';

/**
 * TestimonialCard Component
 *
 * Customer testimonial with avatar, quote, and attribution
 */

interface TestimonialCardProps {
  quote: string;
  author: {
    name: string;
    role: string;
    company?: string;
    avatar?: string;
  };
  rating?: number;
  variant?: 'default' | 'featured';
  className?: string;
}

export function TestimonialCard({
  quote,
  author,
  rating,
  variant = 'default',
  className,
}: TestimonialCardProps) {
  const initials = author.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'p-6 rounded-2xl border transition-all duration-200',
        variant === 'featured'
          ? 'bg-gradient-to-br from-vital-primary-50 to-white border-vital-primary-100'
          : 'bg-white border-stone-200',
        'hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      {/* Rating */}
      {rating && (
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'w-4 h-4',
                i < rating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'
              )}
            />
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote className="text-stone-700 leading-relaxed mb-6">
        "{quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          {author.avatar && <AvatarImage src={author.avatar} alt={author.name} />}
          <AvatarFallback className="bg-vital-primary-100 text-vital-primary-600 text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-stone-800">{author.name}</div>
          <div className="text-sm text-stone-500">
            {author.role}
            {author.company && ` at ${author.company}`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestimonialCard;

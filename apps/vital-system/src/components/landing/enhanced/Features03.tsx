'use client';

import { ReactNode } from 'react';
import { ArrowRight, Check } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface BulletItem {
  icon?: ReactNode;
  title: string;
  description?: string;
}

interface FeatureCard {
  title: string;
  subtitle?: string;
  bulletItems: BulletItem[];
  media?: ReactNode;
  accent?: boolean; // If true, uses purple accent styling
}

interface Features03Props {
  eyebrow?: string;
  title?: ReactNode;
  description?: string;
  leftCard: FeatureCard;
  rightCard: FeatureCard;
  className?: string;
}

// ============================================================================
// FEATURE CARD COMPONENT
// ============================================================================

function FeatureCardSection({ card, side }: { card: FeatureCard; side: 'left' | 'right' }) {
  const isAccent = card.accent;

  return (
    <div
      className={`
        rounded-2xl p-8 h-full flex flex-col
        ${isAccent
          ? 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200'
          : 'bg-white border border-stone-200'}
        transition-all duration-300 hover:shadow-lg
        ${isAccent ? 'hover:shadow-purple-200/50' : 'hover:shadow-stone-200/50'}
      `}
    >
      {/* Header */}
      <div className="mb-6">
        {card.subtitle && (
          <span
            className={`
              text-xs font-semibold uppercase tracking-wider mb-2 block
              ${isAccent ? 'text-purple-600' : 'text-stone-500'}
            `}
          >
            {card.subtitle}
          </span>
        )}
        <h3
          className={`
            text-xl md:text-2xl font-bold
            ${isAccent ? 'text-purple-700' : 'text-stone-700'}
          `}
        >
          {card.title}
        </h3>
      </div>

      {/* Media Section */}
      {card.media && (
        <div className="flex justify-center items-center mb-8 min-h-[180px]">
          {card.media}
        </div>
      )}

      {/* Bullet Items */}
      <div className="space-y-4 flex-1">
        {card.bulletItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${isAccent
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-stone-100 text-stone-600'}
              `}
            >
              {item.icon || <Check className="w-4 h-4" />}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h4
                className={`
                  font-semibold text-sm md:text-base
                  ${isAccent ? 'text-purple-700' : 'text-stone-700'}
                `}
              >
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-stone-500 mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// FEATURES03 MAIN COMPONENT
// ============================================================================

export function Features03({
  eyebrow,
  title = 'Compare the approaches',
  description,
  leftCard,
  rightCard,
  className = '',
}: Features03Props) {
  return (
    <section className={`py-24 bg-stone-100 ${className}`}>
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          {eyebrow && (
            <span className="text-sm font-medium uppercase tracking-wider text-purple-600 mb-4 block">
              {eyebrow}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              {description}
            </p>
          )}
          <div className="w-48 h-1 bg-purple-600 mx-auto rounded-full mt-6" />
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_80px_1fr] gap-4 mb-8">
          <div className="text-center hidden lg:block">
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
              {leftCard.subtitle || 'Traditional Approach'}
            </h3>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <span className="text-xs italic text-stone-400">Transform</span>
            <ArrowRight className="w-4 h-4 ml-1 text-purple-600" />
          </div>
          <div className="text-center hidden lg:block">
            <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
              {rightCard.subtitle || 'VITAL Approach'}
            </h3>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_80px_1fr] gap-6 items-stretch">
          {/* Left Card */}
          <FeatureCardSection card={leftCard} side="left" />

          {/* Arrow Divider (desktop only) */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="h-px w-full bg-stone-300 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-100 px-2">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Arrow (between cards) */}
          <div className="flex lg:hidden items-center justify-center py-4">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
              <ArrowRight className="w-5 h-5 text-white rotate-90" />
            </div>
          </div>

          {/* Right Card */}
          <FeatureCardSection card={rightCard} side="right" />
        </div>

        {/* Footer Tagline */}
        <div className="text-center mt-16 pt-8 border-t border-stone-300">
          <p className="text-lg font-medium text-stone-600">
            Beyond Consulting, Beyond Software, Beyond Services
          </p>
        </div>
      </div>
    </section>
  );
}

export default Features03;

'use client';

import { cn } from '@vital/ui/lib/utils';

export type ServiceLine =
  | 'regulatory'
  | 'clinical'
  | 'safety'
  | 'data'
  | 'market'
  | 'research'
  | 'quality'
  | 'strategy';

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AnimationState = 'static' | 'pulse' | 'morphing';

interface VitalLogoProps {
  serviceLine?: ServiceLine;
  size?: LogoSize;
  animated?: AnimationState;
  className?: string;
}

const serviceLineColors: Record<ServiceLine, string> = {
  regulatory: 'text-regulatory-blue',
  clinical: 'text-clinical-green',
  safety: 'text-safety-red',
  data: 'text-data-purple',
  market: 'text-market-orange',
  research: 'text-research-cyan',
  quality: 'text-quality-gold',
  strategy: 'text-strategy-navy',
};

const sizeClasses: Record<LogoSize, { text: string; dot: string }> = {
  xs: { text: 'text-sm', dot: 'text-xs' },
  sm: { text: 'text-base', dot: 'text-sm' },
  md: { text: 'text-xl', dot: 'text-lg' },
  lg: { text: 'text-3xl', dot: 'text-2xl' },
  xl: { text: 'text-5xl', dot: 'text-4xl' },
};

const animationClasses: Record<AnimationState, string> = {
  static: '',
  pulse: 'animate-journey-pulse',
  morphing: 'animate-pulse',
};

export function VitalLogo({
  serviceLine = 'regulatory',
  size = 'md',
  animated = 'static',
  className,
}: VitalLogoProps) {
  const dotColor = serviceLineColors[serviceLine];
  const { text: textSize, dot: dotSize } = sizeClasses[size];
  const animationClass = animationClasses[animated];

  return (
    <div className={cn('inline-flex items-baseline gap-0 font-sans', className)}>
      <span className={cn('font-extrabold tracking-tight text-vital-black', textSize)}>
        VITAL
      </span>
      <span className={cn('mx-0.5 font-bold', dotSize, dotColor, animationClass)}>
        •
      </span>
      <span className={cn('font-semibold tracking-tight text-vital-black', textSize)}>
        expert
      </span>
    </div>
  );
}

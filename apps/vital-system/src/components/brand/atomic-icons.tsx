'use client';

import { cn } from '@/lib/utils';
import { VITAL_COLORS } from '@/lib/brand/brand-tokens';

/**
 * Atomic Geometry Icon System
 *
 * Based on VITAL Brand Guidelines v5.0/v6.0:
 * - Circle: Insight, Cognition, Origin
 * - Square: Structure, Stability, Container
 * - Triangle: Growth, Direction, Transformation
 * - Line: Connection, Logic, Pathway
 * - Diamond: Precision, Evaluation, Decision
 */

export type AtomicShape = 'circle' | 'square' | 'triangle' | 'line' | 'diamond';
export type AtomicSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AtomicVariant = 'solid' | 'outline' | 'ghost';

interface AtomicIconProps {
  shape: AtomicShape;
  size?: AtomicSize;
  variant?: AtomicVariant;
  animated?: boolean;
  className?: string;
  color?: string;
}

const SHAPE_COLORS: Record<AtomicShape, string> = {
  circle: VITAL_COLORS.geometry.circle,
  square: VITAL_COLORS.geometry.square,
  triangle: VITAL_COLORS.geometry.triangle,
  line: VITAL_COLORS.geometry.line,
  diamond: VITAL_COLORS.geometry.diamond,
};

const SIZES: Record<AtomicSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export function AtomicIcon({
  shape,
  size = 'md',
  variant = 'solid',
  animated = false,
  className,
  color,
}: AtomicIconProps) {
  const sizeValue = SIZES[size];
  const shapeColor = color || SHAPE_COLORS[shape];

  const baseClass = cn(
    'inline-flex items-center justify-center flex-shrink-0',
    animated && 'animate-pulse',
    className
  );

  const getFill = () => {
    if (variant === 'outline' || variant === 'ghost') return 'none';
    return shapeColor;
  };

  const getStroke = () => {
    if (variant === 'ghost') return 'currentColor';
    return shapeColor;
  };

  const getStrokeWidth = () => {
    if (variant === 'solid') return 0;
    return 1.5;
  };

  const renderShape = () => {
    const fill = getFill();
    const stroke = getStroke();
    const strokeWidth = getStrokeWidth();

    switch (shape) {
      case 'circle':
        return (
          <svg
            width={sizeValue}
            height={sizeValue}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </svg>
        );

      case 'square':
        return (
          <svg
            width={sizeValue}
            height={sizeValue}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="4"
              y="4"
              width="16"
              height="16"
              rx="2"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </svg>
        );

      case 'triangle':
        return (
          <svg
            width={sizeValue}
            height={sizeValue}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L21 20H3L12 4Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'line':
        return (
          <svg
            width={sizeValue}
            height={sizeValue}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="4"
              y1="12"
              x2="20"
              y2="12"
              stroke={stroke}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </svg>
        );

      case 'diamond':
        return (
          <svg
            width={sizeValue}
            height={sizeValue}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 3L21 12L12 21L3 12L12 3Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          </svg>
        );

      default:
        return null;
    }
  };

  return <span className={baseClass}>{renderShape()}</span>;
}

// Semantic exports for common use cases
export function InsightIcon(props: Omit<AtomicIconProps, 'shape'>) {
  return <AtomicIcon shape="circle" {...props} />;
}

export function StructureIcon(props: Omit<AtomicIconProps, 'shape'>) {
  return <AtomicIcon shape="square" {...props} />;
}

export function GrowthIcon(props: Omit<AtomicIconProps, 'shape'>) {
  return <AtomicIcon shape="triangle" {...props} />;
}

export function ConnectionIcon(props: Omit<AtomicIconProps, 'shape'>) {
  return <AtomicIcon shape="line" {...props} />;
}

export function DecisionIcon(props: Omit<AtomicIconProps, 'shape'>) {
  return <AtomicIcon shape="diamond" {...props} />;
}

// Tier-based icon helper
export function TierIcon({
  tier,
  ...props
}: { tier: 1 | 2 | 3 } & Omit<AtomicIconProps, 'shape'>) {
  const shapes: Record<1 | 2 | 3, AtomicShape> = {
    1: 'circle',
    2: 'square',
    3: 'triangle',
  };
  return <AtomicIcon shape={shapes[tier]} {...props} />;
}

export default AtomicIcon;

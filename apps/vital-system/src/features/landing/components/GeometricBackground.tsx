'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Geometric Background Component
 *
 * Floating atomic geometry shapes that represent "Human Genius, Amplified"
 * - Circle (Purple): Insight, Cognition
 * - Square (Amber): Structure, Stability
 * - Triangle (Emerald): Growth, Transformation
 * - Line (Indigo): Connection, Pathway
 * - Diamond (Pink): Precision, Decision
 */

interface Shape {
  id: number;
  type: 'circle' | 'square' | 'triangle' | 'diamond';
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  color: string;
  delay: number;
}

const SHAPE_COLORS = {
  circle: '#9055E0',   // Purple - Insight
  square: '#F59E0B',   // Amber - Structure
  triangle: '#10B981', // Emerald - Growth
  diamond: '#EC4899',  // Pink - Decision
};

function generateShapes(count: number): Shape[] {
  const shapes: Shape[] = [];
  const types: Shape['type'][] = ['circle', 'square', 'triangle', 'diamond'];

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    shapes.push({
      id: i,
      type,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 20 + Math.random() * 60,
      rotation: Math.random() * 360,
      opacity: 0.08 + Math.random() * 0.15,
      color: SHAPE_COLORS[type],
      delay: i * 0.1,
    });
  }

  return shapes;
}

function ShapeSVG({ type, size, color }: { type: Shape['type']; size: number; color: string }) {
  switch (type) {
    case 'circle':
      return (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 2}
          fill={color}
          stroke={color}
          strokeWidth="1"
        />
      );
    case 'square':
      return (
        <rect
          x="2"
          y="2"
          width={size - 4}
          height={size - 4}
          rx="4"
          fill={color}
          stroke={color}
          strokeWidth="1"
        />
      );
    case 'triangle':
      const points = `${size / 2},4 ${size - 4},${size - 4} 4,${size - 4}`;
      return (
        <polygon
          points={points}
          fill={color}
          stroke={color}
          strokeWidth="1"
        />
      );
    case 'diamond':
      const diamondPoints = `${size / 2},2 ${size - 2},${size / 2} ${size / 2},${size - 2} 2,${size / 2}`;
      return (
        <polygon
          points={diamondPoints}
          fill={color}
          stroke={color}
          strokeWidth="1"
        />
      );
    default:
      return null;
  }
}

interface GeometricBackgroundProps {
  className?: string;
  shapeCount?: number;
  enableParallax?: boolean;
}

export function GeometricBackground({
  className = '',
  shapeCount = 24,
  enableParallax = true,
}: GeometricBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    setShapes(generateShapes(shapeCount));
  }, [shapeCount]);

  useEffect(() => {
    if (!enableParallax) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableParallax]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #78716C 1px, transparent 1px),
            linear-gradient(to bottom, #78716C 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Floating shapes */}
      {shapes.map((shape) => {
        const mouseOffsetX = enableParallax ? (mousePosition.x - 0.5) * 20 * (shape.size / 80) : 0;
        const mouseOffsetY = enableParallax ? (mousePosition.y - 0.5) * 20 * (shape.size / 80) : 0;

        return (
          <motion.div
            key={shape.id}
            className="absolute"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: shape.opacity,
              scale: 1,
              x: mouseOffsetX,
              y: mouseOffsetY,
            }}
            transition={{
              opacity: { duration: 1, delay: shape.delay },
              scale: { duration: 0.8, delay: shape.delay },
              x: { duration: 0.3, ease: 'easeOut' },
              y: { duration: 0.3, ease: 'easeOut' },
            }}
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              transform: `rotate(${shape.rotation}deg)`,
            }}
          >
            <motion.svg
              width={shape.size}
              height={shape.size}
              viewBox={`0 0 ${shape.size} ${shape.size}`}
              style={enableParallax ? { y: parallaxY } : undefined}
              animate={{
                rotate: [shape.rotation, shape.rotation + 10, shape.rotation],
              }}
              transition={{
                rotate: {
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            >
              <ShapeSVG type={shape.type} size={shape.size} color={shape.color} />
            </motion.svg>
          </motion.div>
        );
      })}

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9055E0" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        {/* Diagonal connection lines */}
        <motion.line
          x1="10%"
          y1="20%"
          x2="40%"
          y2="60%"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
        <motion.line
          x1="60%"
          y1="10%"
          x2="90%"
          y2="50%"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.8 }}
        />
        <motion.line
          x1="30%"
          y1="70%"
          x2="70%"
          y2="90%"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1.1 }}
        />
      </svg>

      {/* Large accent shapes for depth */}
      <motion.div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle, #9055E0 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full opacity-[0.02]"
        style={{
          background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
    </div>
  );
}

export default GeometricBackground;

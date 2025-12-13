'use client';

import { cn } from '../../lib/utils';

/**
 * Flat Visual Components - VITAL Brand Guidelines v6.0
 *
 * 2D flat design system with motion for VITAL landing page
 * Inspired by the paradigm shift infographic style
 *
 * Color Palette (Brand v6.0):
 * - Primary Accent: #9055E0 (Warm Purple)
 * - Accent Hover: #7C3AED
 * - Accent Light: #A855F7
 * - Accent Subtle: #C084FC
 * - Canvas: #FAFAF9 (stone-50)
 * - Surface: #F5F5F4 (stone-100)
 * - Text Primary: #57534E (stone-600)
 * - Text Muted: #A8A29E (stone-400)
 */

// =============================================================================
// FLAT CUBE (2D Square with subtle depth)
// =============================================================================

interface FlatCubeProps {
  size?: number;
  color?: 'purple' | 'gray' | 'outline';
  className?: string;
  animated?: boolean;
}

export function FlatCube({ size = 24, color = 'purple', className, animated = false }: FlatCubeProps) {
  const colors = {
    purple: { fill: '#9055E0', stroke: '#7C3AED' },
    gray: { fill: '#A8A29E', stroke: '#78716C' },
    outline: { fill: 'none', stroke: '#78716C' },
  };
  const c = colors[color];

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={cn(animated && 'animate-pulse', className)}>
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="2"
        fill={c.fill}
        stroke={c.stroke}
        strokeWidth="1.5"
      />
    </svg>
  );
}

// =============================================================================
// FIXED CAPACITY GRID (3x3 flat squares) - Static, rigid structure
// =============================================================================

interface FixedGridProps {
  className?: string;
}

export function FixedGrid({ className }: FixedGridProps) {
  return (
    <svg viewBox="0 0 120 120" className={cn('w-full h-full', className)}>
      {/* Border frame - stone-300 */}
      <rect x="10" y="10" width="100" height="100" fill="none" stroke="#D6D3D1" strokeWidth="2" rx="4" />

      {/* 3x3 grid of squares */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={18 + col * 32}
            y={18 + row * 32}
            width="28"
            height="28"
            fill={row === 2 && col === 0 ? '#57534E' : '#E7E5E4'}
            stroke="#A8A29E"
            strokeWidth="1"
            rx="2"
          />
        ))
      )}
    </svg>
  );
}

// =============================================================================
// ELASTIC NETWORK (Flat constellation diagram) - With subtle pulse animation
// =============================================================================

interface ElasticNetworkProps {
  className?: string;
  animated?: boolean;
}

export function ElasticNetwork({ className, animated = true }: ElasticNetworkProps) {
  // Node positions for constellation
  const nodes = [
    // Inner ring
    { x: 100, y: 50, size: 8, type: 'cube', delay: 0 },
    { x: 140, y: 80, size: 6, type: 'dot', delay: 0.1 },
    { x: 130, y: 130, size: 10, type: 'cube', delay: 0.2 },
    { x: 80, y: 140, size: 6, type: 'dot', delay: 0.3 },
    { x: 50, y: 110, size: 8, type: 'cube', delay: 0.4 },
    { x: 60, y: 70, size: 6, type: 'dot', delay: 0.5 },
    // Outer ring
    { x: 100, y: 20, size: 10, type: 'cube', delay: 0.6 },
    { x: 160, y: 50, size: 8, type: 'cube', delay: 0.7 },
    { x: 170, y: 110, size: 6, type: 'dot', delay: 0.8 },
    { x: 140, y: 160, size: 10, type: 'cube', delay: 0.9 },
    { x: 70, y: 170, size: 8, type: 'cube', delay: 1.0 },
    { x: 30, y: 130, size: 6, type: 'dot', delay: 1.1 },
    { x: 25, y: 70, size: 8, type: 'cube', delay: 1.2 },
    { x: 55, y: 30, size: 6, type: 'dot', delay: 1.3 },
    // Far outer
    { x: 180, y: 80, size: 6, type: 'cube', delay: 1.4 },
    { x: 160, y: 180, size: 6, type: 'dot', delay: 1.5 },
    { x: 40, y: 180, size: 8, type: 'cube', delay: 1.6 },
    { x: 10, y: 100, size: 6, type: 'dot', delay: 1.7 },
  ];

  return (
    <svg viewBox="0 0 200 200" className={cn('w-full h-full', className)}>
      <defs>
        {/* Animated pulse for nodes */}
        <style>
          {`
            @keyframes nodePulse {
              0%, 100% { opacity: 0.7; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.1); }
            }
            @keyframes hubGlow {
              0%, 100% { filter: drop-shadow(0 0 2px rgba(144, 85, 224, 0.3)); }
              50% { filter: drop-shadow(0 0 8px rgba(144, 85, 224, 0.6)); }
            }
            .network-node {
              animation: ${animated ? 'nodePulse 2s ease-in-out infinite' : 'none'};
              transform-origin: center;
              transform-box: fill-box;
            }
            .network-hub {
              animation: ${animated ? 'hubGlow 3s ease-in-out infinite' : 'none'};
            }
          `}
        </style>
      </defs>

      {/* Orbital rings - stone-200 */}
      <circle cx="100" cy="100" r="50" fill="none" stroke="#E7E5E4" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="#E7E5E4" strokeWidth="1" strokeDasharray="4 4" />

      {/* Connection lines from center - stone-300 */}
      {nodes.map((node, i) => (
        <line
          key={`line-${i}`}
          x1="100"
          y1="100"
          x2={node.x}
          y2={node.y}
          stroke="#D6D3D1"
          strokeWidth="1"
          strokeDasharray={node.type === 'dot' ? '2 2' : 'none'}
        />
      ))}

      {/* Nodes - Brand purple #9055E0 */}
      {nodes.map((node, i) =>
        node.type === 'cube' ? (
          <rect
            key={`node-${i}`}
            className="network-node"
            style={{ animationDelay: `${node.delay}s` }}
            x={node.x - node.size / 2}
            y={node.y - node.size / 2}
            width={node.size}
            height={node.size}
            fill="#9055E0"
            rx="1"
          />
        ) : (
          <circle
            key={`node-${i}`}
            className="network-node"
            style={{ animationDelay: `${node.delay}s` }}
            cx={node.x}
            cy={node.y}
            r={node.size / 2}
            fill="#A855F7"
            opacity="0.7"
          />
        )
      )}

      {/* Central hub - Brand purple with glow */}
      <rect
        className="network-hub"
        x="88"
        y="88"
        width="24"
        height="24"
        fill="#9055E0"
        stroke="#7C3AED"
        strokeWidth="2"
        rx="3"
      />
    </svg>
  );
}

// =============================================================================
// LINEAR GROWTH (Flat diagonal with squares) - Static, predictable
// =============================================================================

interface LinearGrowthProps {
  className?: string;
}

export function LinearGrowth({ className }: LinearGrowthProps) {
  return (
    <svg viewBox="0 0 140 100" className={cn('w-full h-full', className)}>
      {/* Growth line - stone-500 */}
      <line x1="20" y1="80" x2="120" y2="20" stroke="#78716C" strokeWidth="2" />

      {/* Squares along the line - stone palette */}
      <rect x="25" y="68" width="14" height="14" fill="#A8A29E" stroke="#78716C" strokeWidth="1" rx="2" />
      <rect x="55" y="48" width="14" height="14" fill="#A8A29E" stroke="#78716C" strokeWidth="1" rx="2" />
      <rect x="85" y="28" width="14" height="14" fill="#78716C" stroke="#57534E" strokeWidth="1" rx="2" />
    </svg>
  );
}

// =============================================================================
// EXPONENTIAL GROWTH (Flat spiral with squares) - Dynamic, expanding
// =============================================================================

interface ExponentialGrowthProps {
  className?: string;
  animated?: boolean;
}

export function ExponentialGrowth({ className, animated = true }: ExponentialGrowthProps) {
  const cubes = [
    { x: 30, y: 70, s: 10, delay: 0 },
    { x: 50, y: 55, s: 12, delay: 0.1 },
    { x: 75, y: 45, s: 14, delay: 0.2 },
    { x: 100, y: 60, s: 12, delay: 0.3 },
    { x: 120, y: 50, s: 14, delay: 0.4 },
    { x: 145, y: 35, s: 16, delay: 0.5 },
    { x: 60, y: 85, s: 10, delay: 0.6 },
    { x: 90, y: 90, s: 12, delay: 0.7 },
    { x: 130, y: 75, s: 14, delay: 0.8 },
    { x: 155, y: 60, s: 12, delay: 0.9 },
    { x: 110, y: 100, s: 10, delay: 1.0 },
    { x: 150, y: 90, s: 12, delay: 1.1 },
  ];

  return (
    <svg viewBox="0 0 180 120" className={cn('w-full h-full', className)}>
      <defs>
        <style>
          {`
            @keyframes growPulse {
              0%, 100% { opacity: 0.8; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.15); }
            }
            .growth-cube {
              animation: ${animated ? 'growPulse 2.5s ease-in-out infinite' : 'none'};
              transform-origin: center;
              transform-box: fill-box;
            }
          `}
        </style>
      </defs>

      {/* Orbital arcs - stone-200 */}
      <path d="M 30 90 Q 90 20 170 50" fill="none" stroke="#E7E5E4" strokeWidth="1" strokeDasharray="4 4" />
      <path d="M 40 110 Q 100 60 170 80" fill="none" stroke="#E7E5E4" strokeWidth="1" strokeDasharray="4 4" />

      {/* Connection lines - stone-300 */}
      {cubes.slice(0, -1).map((cube, i) => (
        <line
          key={`conn-${i}`}
          x1={cube.x + cube.s / 2}
          y1={cube.y + cube.s / 2}
          x2={cubes[i + 1].x + cubes[i + 1].s / 2}
          y2={cubes[i + 1].y + cubes[i + 1].s / 2}
          stroke="#D6D3D1"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      ))}

      {/* Purple squares - Brand #9055E0 */}
      {cubes.map((cube, i) => (
        <rect
          key={`cube-${i}`}
          className="growth-cube"
          style={{ animationDelay: `${cube.delay}s` }}
          x={cube.x}
          y={cube.y}
          width={cube.s}
          height={cube.s}
          fill="#9055E0"
          rx="2"
        />
      ))}
    </svg>
  );
}

// =============================================================================
// KNOWLEDGE LOSS (Scattered fading squares) - Animated fade-out effect
// =============================================================================

interface KnowledgeLossProps {
  className?: string;
  animated?: boolean;
}

export function KnowledgeLoss({ className, animated = true }: KnowledgeLossProps) {
  return (
    <svg viewBox="0 0 140 120" className={cn('w-full h-full', className)}>
      <defs>
        <style>
          {`
            @keyframes fadeAway {
              0%, 20% { opacity: var(--start-opacity); transform: translate(0, 0) rotate(var(--rotation)); }
              100% { opacity: 0; transform: translate(var(--drift-x), var(--drift-y)) rotate(var(--rotation)); }
            }
            .fading-square {
              animation: ${animated ? 'fadeAway 4s ease-out infinite' : 'none'};
            }
          `}
        </style>
        <marker id="arrowGrayLoss" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#A8A29E" />
        </marker>
      </defs>

      {/* Scattered squares with decreasing opacity - stone palette */}
      <rect
        className="fading-square"
        style={{ '--start-opacity': 0.3, '--rotation': '-10deg', '--drift-x': '-5px', '--drift-y': '-10px', animationDelay: '0s' } as React.CSSProperties}
        x="20" y="30" width="16" height="16" fill="#A8A29E" rx="2"
      />
      <rect
        className="fading-square"
        style={{ '--start-opacity': 0.4, '--rotation': '5deg', '--drift-x': '10px', '--drift-y': '-15px', animationDelay: '0.5s' } as React.CSSProperties}
        x="50" y="20" width="14" height="14" fill="#A8A29E" rx="2"
      />
      <rect
        className="fading-square"
        style={{ '--start-opacity': 0.25, '--rotation': '-5deg', '--drift-x': '15px', '--drift-y': '-8px', animationDelay: '1s' } as React.CSSProperties}
        x="85" y="35" width="12" height="12" fill="#A8A29E" rx="2"
      />
      <rect
        className="fading-square"
        style={{ '--start-opacity': 0.2, '--rotation': '15deg', '--drift-x': '20px', '--drift-y': '-12px', animationDelay: '1.5s' } as React.CSSProperties}
        x="110" y="25" width="14" height="14" fill="#A8A29E" rx="2"
      />

      <rect x="35" y="60" width="18" height="18" fill="#78716C" opacity="0.5" rx="2" />
      <rect
        className="fading-square"
        style={{ '--start-opacity': 0.35, '--rotation': '8deg', '--drift-x': '12px', '--drift-y': '5px', animationDelay: '2s' } as React.CSSProperties}
        x="70" y="55" width="14" height="14" fill="#A8A29E" rx="2"
      />
      <rect
        className="fading-square"
        style={{ '--start-opacity': 0.2, '--rotation': '-12deg', '--drift-x': '18px', '--drift-y': '10px', animationDelay: '2.5s' } as React.CSSProperties}
        x="100" y="65" width="12" height="12" fill="#A8A29E" rx="2"
      />

      <rect
        className="fading-square"
        style={{ '--start-opacity': 0.15, '--rotation': '20deg', '--drift-x': '5px', '--drift-y': '15px', animationDelay: '3s' } as React.CSSProperties}
        x="55" y="90" width="10" height="10" fill="#A8A29E" rx="2"
      />
      <rect
        className="fading-square"
        style={{ '--start-opacity': 0.1, '--rotation': '0deg', '--drift-x': '10px', '--drift-y': '20px', animationDelay: '3.5s' } as React.CSSProperties}
        x="90" y="95" width="8" height="8" fill="#A8A29E" rx="2"
      />

      {/* Exit arrows - stone-400 */}
      <path d="M 60 100 L 75 115" stroke="#A8A29E" strokeWidth="1.5" markerEnd="url(#arrowGrayLoss)" opacity="0.5" />
      <path d="M 100 90 L 120 110" stroke="#A8A29E" strokeWidth="1.5" markerEnd="url(#arrowGrayLoss)" opacity="0.4" />
    </svg>
  );
}

// =============================================================================
// KNOWLEDGE PYRAMID (Flat stacked layers) - Animated stacking effect
// =============================================================================

interface KnowledgePyramidProps {
  className?: string;
  animated?: boolean;
}

export function KnowledgePyramid({ className, animated = true }: KnowledgePyramidProps) {
  const layers = [
    { y: 100, width: 140, height: 20, delay: 0, color: '#7C3AED' },     // Base - darker purple
    { y: 78, width: 120, height: 20, delay: 0.15, color: '#9055E0' },   // Brand primary
    { y: 56, width: 100, height: 20, delay: 0.3, color: '#9055E0' },    // Brand primary
    { y: 34, width: 80, height: 20, delay: 0.45, color: '#A855F7' },    // Light purple
    { y: 12, width: 60, height: 20, delay: 0.6, color: '#C084FC' },     // Lightest - top
  ];

  return (
    <svg viewBox="0 0 160 140" className={cn('w-full h-full', className)}>
      <defs>
        <style>
          {`
            @keyframes pyramidGrow {
              0%, 100% { transform: scaleX(1); opacity: 0.9; }
              50% { transform: scaleX(1.02); opacity: 1; }
            }
            .pyramid-layer {
              animation: ${animated ? 'pyramidGrow 3s ease-in-out infinite' : 'none'};
              transform-origin: center;
              transform-box: fill-box;
            }
          `}
        </style>
      </defs>

      {layers.map((layer, i) => (
        <rect
          key={i}
          className="pyramid-layer"
          style={{ animationDelay: `${layer.delay}s` }}
          x={(160 - layer.width) / 2}
          y={layer.y}
          width={layer.width}
          height={layer.height}
          fill={layer.color}
          stroke="#7C3AED"
          strokeWidth="1"
          rx="3"
        />
      ))}
    </svg>
  );
}

export default {
  FlatCube,
  FixedGrid,
  ElasticNetwork,
  LinearGrowth,
  ExponentialGrowth,
  KnowledgeLoss,
  KnowledgePyramid,
};

'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

/**
 * NetworkConstellation Component
 *
 * Creates the "Elastic Organization" visualization with:
 * - Central hub with radiating connections
 * - Orbiting nodes (cubes)
 * - Dashed orbital paths
 * - Dynamic node distribution
 */

interface Node {
  id: string;
  x: number;
  y: number;
  size: number;
  orbit: number;
  angle: number;
  type: 'cube' | 'dot';
}

interface NetworkConstellationProps {
  nodeCount?: number;
  className?: string;
  animated?: boolean;
}

export function NetworkConstellation({
  nodeCount = 24,
  className,
  animated = true,
}: NetworkConstellationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    // Generate nodes in orbital patterns
    const generatedNodes: Node[] = [];
    const orbits = [80, 140, 200, 260];

    for (let i = 0; i < nodeCount; i++) {
      const orbitIndex = Math.floor(Math.random() * orbits.length);
      const orbit = orbits[orbitIndex];
      const angle = (Math.random() * 360) * (Math.PI / 180);
      const variance = (Math.random() - 0.5) * 40;

      generatedNodes.push({
        id: `node-${i}`,
        x: 300 + Math.cos(angle) * (orbit + variance),
        y: 300 + Math.sin(angle) * (orbit + variance),
        size: 8 + Math.random() * 16,
        orbit,
        angle,
        type: Math.random() > 0.3 ? 'cube' : 'dot',
      });
    }

    setNodes(generatedNodes);
  }, [nodeCount]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 600"
      className={cn('w-full h-full', className)}
    >
      <defs>
        {/* Purple gradient for cubes */}
        <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="50%" stopColor="#9B5DE0" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>

        {/* Glow effect */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Orbital paths */}
      {[80, 140, 200, 260].map((radius, i) => (
        <circle
          key={`orbit-${i}`}
          cx="300"
          cy="300"
          r={radius}
          fill="none"
          stroke="#E5E5E5"
          strokeWidth="1"
          strokeDasharray="8 8"
          opacity="0.5"
        />
      ))}

      {/* Connection lines from center to nodes */}
      {nodes.map((node) => (
        <line
          key={`line-${node.id}`}
          x1="300"
          y1="300"
          x2={node.x}
          y2={node.y}
          stroke="#D4D4D4"
          strokeWidth="1"
          strokeDasharray={node.type === 'cube' ? 'none' : '4 4'}
          opacity="0.4"
        />
      ))}

      {/* Nodes */}
      {nodes.map((node) => (
        <g key={node.id} className={animated ? 'animate-pulse' : ''}>
          {node.type === 'cube' ? (
            <IsometricCubeSVG
              x={node.x - node.size / 2}
              y={node.y - node.size / 2}
              size={node.size}
            />
          ) : (
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size / 3}
              fill="#9B5DE0"
              opacity="0.8"
            />
          )}
        </g>
      ))}

      {/* Central hub - larger cube */}
      <g filter="url(#glow)">
        <IsometricCubeSVG x={270} y={270} size={60} />
      </g>

      {/* Radiating lines from center */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30) * (Math.PI / 180);
        const innerRadius = 50;
        const outerRadius = 280;
        return (
          <line
            key={`ray-${i}`}
            x1={300 + Math.cos(angle) * innerRadius}
            y1={300 + Math.sin(angle) * innerRadius}
            x2={300 + Math.cos(angle) * outerRadius}
            y2={300 + Math.sin(angle) * outerRadius}
            stroke="#9B5DE0"
            strokeWidth="1"
            opacity="0.15"
          />
        );
      })}
    </svg>
  );
}

/**
 * Inline isometric cube for SVG context
 */
function IsometricCubeSVG({ x, y, size }: { x: number; y: number; size: number }) {
  const h = size * 0.577;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Top face */}
      <polygon
        points={`${size / 2},0 ${size},${h / 2} ${size / 2},${h} 0,${h / 2}`}
        fill="#C4B5FD"
      />
      {/* Left face */}
      <polygon
        points={`0,${h / 2} ${size / 2},${h} ${size / 2},${h + size * 0.5} 0,${h / 2 + size * 0.5}`}
        fill="#9B5DE0"
      />
      {/* Right face */}
      <polygon
        points={`${size / 2},${h} ${size},${h / 2} ${size},${h / 2 + size * 0.5} ${size / 2},${h + size * 0.5}`}
        fill="#6D28D9"
      />
    </g>
  );
}

export default NetworkConstellation;

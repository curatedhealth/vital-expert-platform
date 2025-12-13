'use client';

import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { IsometricCubeGrid, IsometricPyramid } from './isometric-cube';
import { NetworkConstellation } from './network-constellation';

/**
 * ParadigmComparison Component
 *
 * "From Fixed to Elastic" transformation visualization
 * Matches the VITAL brand visual language with:
 * - Traditional (rigid) vs Elastic (VITAL) organization
 * - Fixed capacity vs Infinite capacity
 * - Linear growth vs Exponential growth
 * - Knowledge loss vs Knowledge compound
 */

interface ComparisonRow {
  traditional: {
    title: string;
    subtitle: string;
    visual: 'grid' | 'linear' | 'puzzle';
  };
  elastic: {
    title: string;
    subtitle: string;
    visual: 'constellation' | 'exponential' | 'pyramid';
  };
}

const COMPARISONS: ComparisonRow[] = [
  {
    traditional: {
      title: 'FIXED CAPACITY',
      subtitle: '10-20 FTEs Max',
      visual: 'grid',
    },
    elastic: {
      title: 'INFINITE CAPACITY',
      subtitle: 'Unlimited Scale',
      visual: 'constellation',
    },
  },
  {
    traditional: {
      title: 'LINEAR GROWTH',
      subtitle: 'Linear growth trajectory',
      visual: 'linear',
    },
    elastic: {
      title: 'EXPONENTIAL GROWTH',
      subtitle: 'Exponential growth potential',
      visual: 'exponential',
    },
  },
  {
    traditional: {
      title: 'KNOWLEDGE LOSS',
      subtitle: 'Knowledge walks out the door',
      visual: 'puzzle',
    },
    elastic: {
      title: 'KNOWLEDGE COMPOUND',
      subtitle: 'Knowledge compounds forever',
      visual: 'pyramid',
    },
  },
];

interface ParadigmComparisonProps {
  className?: string;
}

export function ParadigmComparison({ className }: ParadigmComparisonProps) {
  return (
    <section className={cn('py-20 md:py-28 bg-[#F5F2EB]', className)}>
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
            PARADIGM SHIFT: FROM FIXED TO ELASTIC
          </h2>
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#9B5DE0] to-transparent" />
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-8 mb-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-stone-600 uppercase tracking-wide">
              Traditional<br />(Rigid) Organization
            </h3>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-sm italic text-stone-500">Transform</span>
            <ArrowRight className="w-5 h-5 ml-2 text-[#9B5DE0]" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#9B5DE0] uppercase tracking-wide">
              Elastic (VITAL)<br />Organization
            </h3>
          </div>
        </div>

        {/* Comparison Rows */}
        <div className="space-y-16">
          {COMPARISONS.map((row, index) => (
            <div key={index} className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center">
              {/* Traditional Side */}
              <div className="flex flex-col items-center">
                <div className="h-48 flex items-center justify-center mb-4">
                  <TraditionalVisual type={row.traditional.visual} />
                </div>
                <h4 className="text-lg font-bold text-stone-800 mb-1">
                  {row.traditional.title}
                </h4>
                <p className="text-sm text-stone-500">{row.traditional.subtitle}</p>
              </div>

              {/* Divider */}
              <div className="w-px h-48 bg-stone-300" />

              {/* Elastic Side */}
              <div className="flex flex-col items-center">
                <div className="h-48 flex items-center justify-center mb-4">
                  <ElasticVisual type={row.elastic.visual} />
                </div>
                <h4 className="text-lg font-bold text-[#9B5DE0] mb-1">
                  {row.elastic.title}
                </h4>
                <p className="text-sm text-stone-500">{row.elastic.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer tagline */}
        <div className="text-center mt-16 pt-8 border-t border-stone-300">
          <p className="text-xl font-medium text-stone-700">
            Beyond Consulting, Beyond Software, Beyond Services
          </p>
        </div>
      </div>
    </section>
  );
}

function TraditionalVisual({ type }: { type: 'grid' | 'linear' | 'puzzle' }) {
  if (type === 'grid') {
    return (
      <div className="p-4 border-2 border-stone-300 rounded-lg bg-white">
        <IsometricCubeGrid rows={3} cols={3} cubeSize={28} color="gray" />
      </div>
    );
  }

  if (type === 'linear') {
    return (
      <svg width="180" height="120" viewBox="0 0 180 120">
        {/* Linear growth line */}
        <line x1="20" y1="100" x2="160" y2="20" stroke="#78716C" strokeWidth="2" />
        {/* Cubes along the line */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${30 + i * 50}, ${85 - i * 25})`}>
            <polygon points="12,0 24,7 12,14 0,7" fill="#A8A29E" />
            <polygon points="0,7 12,14 12,26 0,19" fill="#78716C" />
            <polygon points="12,14 24,7 24,19 12,26" fill="#57534E" />
          </g>
        ))}
      </svg>
    );
  }

  // Puzzle (knowledge loss)
  return (
    <svg width="160" height="140" viewBox="0 0 160 140">
      {/* Scattered puzzle pieces / cubes */}
      <g opacity="0.4">
        <g transform="translate(20, 20) rotate(-15)">
          <polygon points="12,0 24,7 12,14 0,7" fill="#A8A29E" />
          <polygon points="0,7 12,14 12,26 0,19" fill="#78716C" />
          <polygon points="12,14 24,7 24,19 12,26" fill="#57534E" />
        </g>
      </g>
      <g opacity="0.5">
        <g transform="translate(60, 40) rotate(10)">
          <polygon points="12,0 24,7 12,14 0,7" fill="#A8A29E" />
          <polygon points="0,7 12,14 12,26 0,19" fill="#78716C" />
          <polygon points="12,14 24,7 24,19 12,26" fill="#57534E" />
        </g>
      </g>
      <g opacity="0.3">
        <g transform="translate(100, 80) rotate(-5)">
          <polygon points="12,0 24,7 12,14 0,7" fill="#A8A29E" />
          <polygon points="0,7 12,14 12,26 0,19" fill="#78716C" />
          <polygon points="12,14 24,7 24,19 12,26" fill="#57534E" />
        </g>
      </g>
      <g opacity="0.2">
        <g transform="translate(130, 30) rotate(20)">
          <polygon points="12,0 24,7 12,14 0,7" fill="#A8A29E" />
          <polygon points="0,7 12,14 12,26 0,19" fill="#78716C" />
          <polygon points="12,14 24,7 24,19 12,26" fill="#57534E" />
        </g>
      </g>
      {/* Arrows indicating loss */}
      <path d="M70 100 L90 120" stroke="#A8A29E" strokeWidth="1" strokeDasharray="4 2" markerEnd="url(#arrowGray)" />
      <defs>
        <marker id="arrowGray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#A8A29E" />
        </marker>
      </defs>
    </svg>
  );
}

function ElasticVisual({ type }: { type: 'constellation' | 'exponential' | 'pyramid' }) {
  if (type === 'constellation') {
    return (
      <div className="w-48 h-48">
        <NetworkConstellation nodeCount={18} animated={false} />
      </div>
    );
  }

  if (type === 'exponential') {
    return (
      <svg width="200" height="160" viewBox="0 0 200 160">
        {/* Orbital paths */}
        <ellipse cx="100" cy="80" rx="80" ry="50" fill="none" stroke="#E5E5E5" strokeWidth="1" strokeDasharray="4 4" />
        <ellipse cx="100" cy="80" rx="60" ry="35" fill="none" stroke="#E5E5E5" strokeWidth="1" strokeDasharray="4 4" />

        {/* Exponentially distributed cubes */}
        {[
          { x: 30, y: 60, s: 16 },
          { x: 50, y: 40, s: 18 },
          { x: 70, y: 90, s: 14 },
          { x: 90, y: 50, s: 20 },
          { x: 110, y: 70, s: 16 },
          { x: 130, y: 45, s: 18 },
          { x: 150, y: 80, s: 14 },
          { x: 170, y: 55, s: 16 },
          { x: 60, y: 110, s: 12 },
          { x: 100, y: 120, s: 14 },
          { x: 140, y: 105, s: 16 },
        ].map((cube, i) => (
          <g key={i} transform={`translate(${cube.x - cube.s / 2}, ${cube.y - cube.s / 2})`}>
            <polygon
              points={`${cube.s / 2},0 ${cube.s},${cube.s * 0.3} ${cube.s / 2},${cube.s * 0.6} 0,${cube.s * 0.3}`}
              fill="#C4B5FD"
            />
            <polygon
              points={`0,${cube.s * 0.3} ${cube.s / 2},${cube.s * 0.6} ${cube.s / 2},${cube.s} 0,${cube.s * 0.7}`}
              fill="#9B5DE0"
            />
            <polygon
              points={`${cube.s / 2},${cube.s * 0.6} ${cube.s},${cube.s * 0.3} ${cube.s},${cube.s * 0.7} ${cube.s / 2},${cube.s}`}
              fill="#6D28D9"
            />
          </g>
        ))}

        {/* Connection lines */}
        {[
          [50, 50, 90, 60],
          [90, 60, 130, 55],
          [70, 90, 100, 120],
          [110, 70, 140, 105],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#D4D4D4"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
      </svg>
    );
  }

  // Pyramid
  return <IsometricPyramid layers={5} baseSize={140} color="purple" />;
}

export default ParadigmComparison;

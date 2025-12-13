'use client';

import { cn } from '../../lib/utils';

/**
 * IsometricCube Component
 *
 * Bauhaus-inspired isometric 3D cube used in VITAL visual language
 * Creates depth through face gradients and positioning
 */

interface IsometricCubeProps {
  size?: number;
  color?: 'purple' | 'gray' | 'gradient';
  className?: string;
  style?: React.CSSProperties;
}

const COLORS = {
  purple: {
    top: '#B794F4',
    left: '#9B5DE0',
    right: '#7C3AED',
  },
  gray: {
    top: '#A8A29E',
    left: '#78716C',
    right: '#57534E',
  },
  gradient: {
    top: '#C4B5FD',
    left: '#9B5DE0',
    right: '#6D28D9',
  },
};

export function IsometricCube({
  size = 40,
  color = 'purple',
  className,
  style,
}: IsometricCubeProps) {
  const colors = COLORS[color];
  const h = size * 0.577; // Height ratio for isometric

  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox={`0 0 ${size} ${size * 1.2}`}
      className={cn('flex-shrink-0', className)}
      style={style}
    >
      {/* Top face */}
      <polygon
        points={`${size / 2},0 ${size},${h / 2} ${size / 2},${h} 0,${h / 2}`}
        fill={colors.top}
      />
      {/* Left face */}
      <polygon
        points={`0,${h / 2} ${size / 2},${h} ${size / 2},${h + size * 0.5} 0,${h / 2 + size * 0.5}`}
        fill={colors.left}
      />
      {/* Right face */}
      <polygon
        points={`${size / 2},${h} ${size},${h / 2} ${size},${h / 2 + size * 0.5} ${size / 2},${h + size * 0.5}`}
        fill={colors.right}
      />
    </svg>
  );
}

/**
 * IsometricCubeGrid - Fixed capacity visualization (3x3 grid)
 */
interface IsometricCubeGridProps {
  rows?: number;
  cols?: number;
  cubeSize?: number;
  color?: 'purple' | 'gray' | 'gradient';
  className?: string;
}

export function IsometricCubeGrid({
  rows = 3,
  cols = 3,
  cubeSize = 32,
  color = 'gray',
  className,
}: IsometricCubeGridProps) {
  const cubes = [];
  const gap = cubeSize * 0.1;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * (cubeSize + gap);
      const y = row * (cubeSize * 0.7 + gap);
      cubes.push(
        <div
          key={`${row}-${col}`}
          style={{
            position: 'absolute',
            left: x,
            top: y,
          }}
        >
          <IsometricCube size={cubeSize} color={color} />
        </div>
      );
    }
  }

  const width = cols * (cubeSize + gap);
  const height = rows * (cubeSize * 0.7 + gap) + cubeSize * 0.5;

  return (
    <div
      className={cn('relative', className)}
      style={{ width, height }}
    >
      {cubes}
    </div>
  );
}

/**
 * IsometricPyramid - Knowledge compound visualization (stacked layers)
 */
interface IsometricPyramidProps {
  layers?: number;
  baseSize?: number;
  color?: 'purple' | 'gray' | 'gradient';
  className?: string;
}

export function IsometricPyramid({
  layers = 5,
  baseSize = 160,
  color = 'purple',
  className,
}: IsometricPyramidProps) {
  const pyramidLayers = [];
  const layerHeight = 24;

  for (let i = 0; i < layers; i++) {
    const layerWidth = baseSize - i * (baseSize / layers) * 0.6;
    const yOffset = i * layerHeight;
    const xOffset = (baseSize - layerWidth) / 2;

    pyramidLayers.push(
      <div
        key={i}
        className="absolute"
        style={{
          bottom: yOffset,
          left: xOffset,
          width: layerWidth,
        }}
      >
        <IsometricLayer width={layerWidth} height={layerHeight} color={color} />
      </div>
    );
  }

  return (
    <div
      className={cn('relative', className)}
      style={{ width: baseSize, height: layers * layerHeight + 20 }}
    >
      {pyramidLayers}
    </div>
  );
}

function IsometricLayer({
  width,
  height,
  color,
}: {
  width: number;
  height: number;
  color: 'purple' | 'gray' | 'gradient';
}) {
  const colors = COLORS[color];

  return (
    <svg width={width} height={height * 1.5} viewBox={`0 0 ${width} ${height * 1.5}`}>
      {/* Top face */}
      <polygon
        points={`${width / 2},0 ${width},${height * 0.4} ${width / 2},${height * 0.8} 0,${height * 0.4}`}
        fill={colors.top}
      />
      {/* Front face */}
      <polygon
        points={`0,${height * 0.4} ${width / 2},${height * 0.8} ${width / 2},${height * 1.4} 0,${height}`}
        fill={colors.left}
      />
      {/* Right face */}
      <polygon
        points={`${width / 2},${height * 0.8} ${width},${height * 0.4} ${width},${height} ${width / 2},${height * 1.4}`}
        fill={colors.right}
      />
    </svg>
  );
}

export default IsometricCube;

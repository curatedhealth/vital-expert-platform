'use client';

import { useEffect, useRef } from 'react';

/**
 * BackgroundPattern Component
 *
 * Brand-aligned geometric background with atomic shapes
 * Based on VITAL Brand Guidelines v6.0:
 * - Circle: #9055E0 (Purple - Insight)
 * - Square: #F59E0B (Amber - Structure)
 * - Triangle: #10B981 (Emerald - Growth)
 * - Diamond: #EC4899 (Pink - Decision)
 * - Line: #6366F1 (Indigo - Connection)
 */

interface BackgroundPatternProps {
  variant?: 'default' | 'minimal' | 'dense';
  className?: string;
}

export function BackgroundPattern({
  variant = 'default',
  className = ''
}: BackgroundPatternProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    const shapes = generateShapes(variant);

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      shapes.forEach((shape) => {
        ctx.save();
        ctx.globalAlpha = shape.opacity;
        ctx.translate(shape.x * canvas.width, shape.y * canvas.height);
        ctx.rotate(shape.rotation);

        switch (shape.type) {
          case 'circle':
            drawCircle(ctx, shape.size, shape.color);
            break;
          case 'square':
            drawSquare(ctx, shape.size, shape.color);
            break;
          case 'triangle':
            drawTriangle(ctx, shape.size, shape.color);
            break;
          case 'diamond':
            drawDiamond(ctx, shape.size, shape.color);
            break;
        }

        ctx.restore();
      });

      // Draw connection lines
      drawConnections(ctx, shapes, canvas.width, canvas.height);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none -z-10 ${className}`}
      aria-hidden="true"
    />
  );
}

interface Shape {
  type: 'circle' | 'square' | 'triangle' | 'diamond';
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
}

function generateShapes(variant: 'default' | 'minimal' | 'dense'): Shape[] {
  const colors = {
    circle: '#9055E0',
    square: '#F59E0B',
    triangle: '#10B981',
    diamond: '#EC4899',
  };

  const count = variant === 'minimal' ? 4 : variant === 'dense' ? 12 : 8;
  const shapes: Shape[] = [];

  const types: Shape['type'][] = ['circle', 'square', 'triangle', 'diamond'];

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    shapes.push({
      type,
      x: 0.1 + Math.random() * 0.8,
      y: 0.1 + Math.random() * 0.8,
      size: 20 + Math.random() * 40,
      color: colors[type],
      opacity: 0.03 + Math.random() * 0.05,
      rotation: Math.random() * Math.PI * 2,
    });
  }

  return shapes;
}

function drawCircle(ctx: CanvasRenderingContext2D, size: number, color: string) {
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawSquare(ctx: CanvasRenderingContext2D, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(-size / 2, -size / 2, size, size);
}

function drawTriangle(ctx: CanvasRenderingContext2D, size: number, color: string) {
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.866, size * 0.5);
  ctx.lineTo(-size * 0.866, size * 0.5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawDiamond(ctx: CanvasRenderingContext2D, size: number, color: string) {
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.7, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.7, 0);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawConnections(
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  width: number,
  height: number
) {
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.03)'; // Indigo - Connection
  ctx.lineWidth = 1;

  for (let i = 0; i < shapes.length - 1; i++) {
    const a = shapes[i];
    const b = shapes[i + 1];

    ctx.beginPath();
    ctx.moveTo(a.x * width, a.y * height);
    ctx.lineTo(b.x * width, b.y * height);
    ctx.stroke();
  }
}

export default BackgroundPattern;

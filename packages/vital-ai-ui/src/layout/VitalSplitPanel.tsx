'use client';

import { useState, useRef, useCallback, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { GripVertical } from 'lucide-react';

interface VitalSplitPanelProps {
  children: [ReactNode, ReactNode];
  direction?: 'horizontal' | 'vertical';
  defaultSize?: number; // percentage for first panel
  minSize?: number; // minimum percentage
  maxSize?: number; // maximum percentage
  onResize?: (size: number) => void;
  className?: string;
}

/**
 * VitalSplitPanel - Resizable split panel component
 * 
 * Creates a draggable split between two panels.
 * Supports horizontal and vertical orientations.
 * Reusable across all services for editor layouts.
 */
export function VitalSplitPanel({
  children,
  direction = 'horizontal',
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
  onResize,
  className
}: VitalSplitPanelProps) {
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let newSize: number;

      if (direction === 'horizontal') {
        newSize = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        newSize = ((e.clientY - rect.top) / rect.height) * 100;
      }

      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(newSize);
      onResize?.(newSize);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [direction, minSize, maxSize, onResize]);

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex w-full h-full",
        isHorizontal ? "flex-row" : "flex-col",
        isDragging && "select-none",
        className
      )}
    >
      {/* First panel */}
      <div
        className="overflow-auto"
        style={{
          [isHorizontal ? 'width' : 'height']: `${size}%`,
          flexShrink: 0,
        }}
      >
        {children[0]}
      </div>

      {/* Resizer */}
      <div
        className={cn(
          "relative flex items-center justify-center bg-border",
          "hover:bg-primary/20 transition-colors",
          isHorizontal ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize",
          isDragging && "bg-primary/40"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className={cn(
          "absolute rounded bg-muted-foreground/30",
          "opacity-0 hover:opacity-100 transition-opacity",
          isDragging && "opacity-100",
          isHorizontal ? "w-1 h-8" : "h-1 w-8"
        )}>
          <GripVertical className={cn(
            "h-4 w-4 text-muted-foreground",
            !isHorizontal && "rotate-90"
          )} />
        </div>
      </div>

      {/* Second panel */}
      <div className="flex-1 overflow-auto">
        {children[1]}
      </div>
    </div>
  );
}

export default VitalSplitPanel;

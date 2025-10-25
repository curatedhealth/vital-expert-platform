'use client';

import Image from 'next/image';
import { useState } from 'react';

import { type Icon } from '@/shared/services/icon-service';

interface OptimizedIconRendererProps {
  icon: Icon;
  size?: number;
  onClick?: () => void;
  isSelected?: boolean;
}

/**
 * Optimized icon renderer using next/image
 * Provides automatic image optimization and lazy loading
 */
export function OptimizedIconRenderer({
  icon,
  size = 48,
  onClick,
  isSelected = false
}: OptimizedIconRendererProps) {
  const [imageError, setImageError] = useState(false);

  const iconUrl = icon.icon || icon.file_url;
  const isImagePath = iconUrl?.startsWith('/') || iconUrl?.startsWith('http');

  if (isImagePath && !imageError) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center p-1 cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={onClick}
      >
        <div className="relative w-full h-full">
          <Image
            src={iconUrl}
            alt={icon.display_name}
            width={size}
            height={size}
            className="object-cover rounded"
            onError={() => setImageError(true)}
            loading="lazy"
            quality={75}
          />
        </div>
      </div>
    );
  }

  // Fallback to emoji or text
  return (
    <div
      className={`w-full h-full flex items-center justify-center cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <span className="text-2xl">{icon.file_url || '🤖'}</span>
    </div>
  );
}

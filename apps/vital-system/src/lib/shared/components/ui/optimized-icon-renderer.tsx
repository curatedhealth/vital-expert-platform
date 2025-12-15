'use client';

import Image from 'next/image';
import { useState } from 'react';

import { type Icon } from '@/lib/shared/services/icon-service';

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
  
  // Default fallback icon from general PNG directory
  const defaultFallback = '/icons/png/general/AI Brain.png';

  if (isImagePath && !imageError) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center p-1 cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-vital-primary-500' : ''
        }`}
        onClick={onClick}
      >
        <div className="relative w-full h-full">
          <Image
            src={iconUrl}
            alt={icon.display_name || 'Icon'}
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

  // Fallback to default PNG icon
  return (
    <div
      className={`w-full h-full flex items-center justify-center cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-vital-primary-500' : ''
      }`}
      onClick={onClick}
    >
      <Image
        src={defaultFallback}
        alt={icon.display_name || 'Icon'}
        width={size}
        height={size}
        className="object-cover rounded opacity-60"
        loading="lazy"
        quality={75}
      />
    </div>
  );
}

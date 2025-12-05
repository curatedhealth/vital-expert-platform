'use client';

import Image from 'next/image';
import { useState } from 'react';

import { type Agent } from '@/lib/stores/chat-store';
import { cn } from '@vital/ui/lib/utils';

// Support both old and new interfaces for backward compatibility
interface AgentAvatarProps {
  agent?: Agent;
  avatar?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  priority?: boolean; // For above-the-fold images
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const sizePx = {
  sm: 24,
  md: 40,
  lg: 48,
  xl: 64
};

/**
 * Optimized agent avatar component using next/image
 * Provides automatic image optimization, lazy loading, and blur placeholders
 */
export function AgentAvatarOptimized({
  agent,
  avatar: avatarProp,
  name: nameProp,
  size = 'md',
  className,
  priority = false
}: AgentAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Support both old and new interfaces
  const avatar = agent?.avatar || avatarProp || '🤖';
  const name = agent?.name || nameProp || 'Agent';

  // Function to get the proper icon URL with simplified PNG naming
  const getIconUrl = (iconUrl: string) => {
    // If it's already a local PNG path, use it
    if (iconUrl.startsWith('/icons/png/')) {
      return iconUrl;
    }

    // For avatar names that match our database icons, use them directly
    if (iconUrl.match(/^avatar_\d{4}$/)) {
      // Use 4-digit PNG filenames
      return `/icons/png/avatars/${iconUrl}.png`;
    }

    // Support legacy 3-digit format by converting to 4-digit
    if (iconUrl.match(/^avatar_\d{3}$/)) {
      const num = iconUrl.replace('avatar_', '');
      const paddedNum = num.padStart(4, '0');
      return `/icons/png/avatars/avatar_${paddedNum}.png`;
    }

    return iconUrl;
  };

  // Check if avatar is a file path, URL, or our avatar naming pattern
  const isImagePath = avatar && (
    avatar.startsWith('/') ||
    avatar.startsWith('http') ||
    avatar.match(/^avatar_\d{3,4}$/) // Support both 3-digit and 4-digit avatar patterns
  );

  if (isImagePath && !imageError) {
    const iconUrl = getIconUrl(avatar);
    const dimensions = sizePx[size as keyof typeof sizePx] || sizePx.md;

    return (
      <div className={cn(
        'flex items-center justify-center rounded-lg overflow-hidden bg-white border border-neutral-200 relative',
        sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md,
        className
      )}>
        <Image
          src={iconUrl}
          alt={name}
          width={dimensions}
          height={dimensions}
          className="object-cover"
          priority={priority}
          onError={() => setImageError(true)}
          // Disable blur placeholder for small avatar images
          placeholder="empty"
          quality={85}
        />
      </div>
    );
  }

  // For emoji avatars or when image fails, display them with proper sizing
  return (
    <div className={cn(
      'flex items-center justify-center rounded-sm bg-neutral-50 border border-neutral-200',
      sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md,
      className
    )}>
      <span className={cn(
        'text-center',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
        size === 'xl' && 'text-lg'
      )}>
        {avatar || '🤖'}
      </span>
    </div>
  );
}

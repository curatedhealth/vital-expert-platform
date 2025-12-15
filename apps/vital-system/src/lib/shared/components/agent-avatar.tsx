import { useState } from 'react';
import Image from 'next/image';
import { type Agent } from '@/lib/stores/chat-store';
import { cn } from '@vital/ui/lib/utils';

// Support both old and new interfaces for backward compatibility
interface AgentAvatarProps {
  agent?: Agent;
  avatar?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: { container: 'w-6 h-6', image: 24 },
  md: { container: 'w-10 h-10', image: 40 },
  lg: { container: 'w-12 h-12', image: 48 },
  xl: { container: 'w-16 h-16', image: 64 }
};

export function AgentAvatar({ agent, avatar: avatarProp, name: nameProp, size = 'md', className }: AgentAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  // Support both old and new interfaces
  const avatar = agent?.avatar || avatarProp || 'avatar_0001';
  const name = agent?.name || agent?.display_name || nameProp || 'Agent';

  // Function to get the proper icon URL with simplified PNG naming
  const getIconUrl = (iconUrl: string): string => {
    // If it's already a full URL (Supabase, etc.), use it
    if (iconUrl.startsWith('http://') || iconUrl.startsWith('https://')) {
      return iconUrl;
    }

    // If it's already a local PNG path, use it
    if (iconUrl.startsWith('/icons/png/')) {
      return iconUrl;
    }

    // For avatar names that match our database icons, use them directly
    if (iconUrl.match(/^avatar_\d{4}$/)) {
      return `/icons/png/avatars/${iconUrl}.png`;
    }

    // Support legacy 3-digit format by converting to 4-digit
    if (iconUrl.match(/^avatar_\d{3}$/)) {
      const num = iconUrl.replace('avatar_', '');
      const paddedNum = num.padStart(4, '0');
      return `/icons/png/avatars/avatar_${paddedNum}.png`;
    }

    // Default fallback to first avatar
    return '/icons/png/avatars/avatar_0001.png';
  };

  const iconUrl = getIconUrl(avatar);
  const sizeConfig = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;
  const fallbackAvatar = '/icons/png/avatars/avatar_0001.png';

  return (
    <div className={cn(
      'flex items-center justify-center rounded-lg overflow-hidden bg-vital-slate-100 border border-vital-slate-200 shadow-sm',
      sizeConfig.container,
      className
    )}>
      {!imageError ? (
        <Image
          src={iconUrl}
          alt={name}
          width={sizeConfig.image}
          height={sizeConfig.image}
          className="w-full h-full object-cover"
          onError={() => {
            setImageError(true);
          }}
          loading="lazy"
        />
      ) : (
        <Image
          src={fallbackAvatar}
          alt={name}
          width={sizeConfig.image}
          height={sizeConfig.image}
          className="w-full h-full object-cover opacity-60"
        />
      )}
    </div>
  );
}
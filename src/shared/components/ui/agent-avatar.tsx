import { cn } from '@/shared/services/utils';

// Make the agent type flexible to support different agent interfaces
type FlexibleAgent = {
  avatar?: string;
  name?: string;
  display_name?: string;
};

// Support both old and new interfaces for backward compatibility
interface AgentAvatarProps {
  agent?: FlexibleAgent;
  avatar?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-20 h-20',
  '2xl': 'w-24 h-24'
};

export function AgentAvatar({ agent, avatar: avatarProp, name: nameProp, size = 'md', className }: AgentAvatarProps) {
  // Support both old and new interfaces
  const avatar = agent?.avatar || avatarProp || '🤖';
  const name = agent?.name || agent?.display_name || nameProp || 'Agent';

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

    // For any external URL or old Supabase URL, use a default avatar
    // We'll assign avatars based on a hash of the URL for consistency
    const getAvatarId = (url: string) => {
      let hash = 0;
      for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      // Use available avatar files from our database: avatar_0001 through avatar_0119
      const availableAvatars = [];
      for (let i = 1; i <= 119; i++) {
        const num = i.toString().padStart(4, '0');
        availableAvatars.push(`avatar_${num}`);
      }

      const index = Math.abs(hash % availableAvatars.length);
      return availableAvatars[index];
    };

    if (iconUrl.startsWith('http') || iconUrl.includes('supabase.co') || iconUrl.includes('storage/')) {
      const avatarName = getAvatarId(iconUrl);
      return `/icons/png/avatars/${avatarName}.png`;
    }

    return iconUrl;
  };

  // Check if avatar is a file path, URL, or our avatar naming pattern
  const isImagePath = avatar && (
    avatar.startsWith('/') ||
    avatar.startsWith('http') ||
    avatar.match(/^avatar_\d{3,4}$/) // Support both 3-digit and 4-digit avatar patterns
  );

  if (isImagePath) {
    const iconUrl = getIconUrl(avatar);
    const fallbackAvatar = '/icons/png/avatars/avatar_0001.png';

    return (
      <div className={cn('rounded-lg overflow-hidden bg-white border border-gray-200', sizeClasses[size], className)}>
        <img
          src={iconUrl}
          alt={name}
          className="object-cover w-full h-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== fallbackAvatar) {
              target.src = fallbackAvatar;
            } else {
              // If fallback also fails, show emoji
              target.style.display = 'none';
              const parent = target.parentNode as HTMLElement;
              if (parent) {
                parent.innerHTML = '<span class="text-4xl">🤖</span>';
              }
            }
          }}
        />
      </div>
    );
  }

  // For emoji avatars, display them with proper sizing
  return (
    <div className={cn(
      'flex items-center justify-center rounded-sm bg-gray-50 border border-gray-200',
      sizeClasses[size],
      className
    )}>
      <span className={cn(
        'text-center',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
        size === 'xl' && 'text-4xl',
        size === '2xl' && 'text-5xl'
      )}>
        {avatar || '🤖'}
      </span>
    </div>
  );
}
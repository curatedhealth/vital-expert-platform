import { type Agent } from '@/lib/stores/chat-store';
import { cn } from '@/lib/utils';

// Support both old and new interfaces for backward compatibility
interface AgentAvatarProps {
  agent?: Agent;
  avatar?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'list' | 'card';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20',
  list: 'w-[30px] h-[30px]',
  card: 'w-[50px] h-[50px]'
};

export function AgentAvatar({ agent, avatar: avatarProp, name: nameProp, size = 'md', className }: AgentAvatarProps) {
  // Support both old and new interfaces
  const avatar = agent?.avatar || avatarProp || '🤖';
  const name = agent?.name || nameProp || 'Agent';

  // Function to get the proper icon URL with simplified PNG naming
  const getIconUrl = (iconUrl: string) => {
    // Handle full URLs (Supabase storage or external URLs)
    if (iconUrl.startsWith('http://') || iconUrl.startsWith('https://')) {
      return iconUrl;
    }

    // If it's already a local PNG path, use it directly (this handles our new database format)
    if (iconUrl.startsWith('/icons/png/')) {
      return iconUrl;
    }

    // Clean up double .png extensions
    let cleanIconUrl = iconUrl;
    while (cleanIconUrl.includes('.png.png')) {
      cleanIconUrl = cleanIconUrl.replace('.png.png', '.png');
    }

    // For avatar names that match our database icons, use them directly
    if (cleanIconUrl.match(/^avatar_\d{4}$/)) {
      // Use 4-digit PNG filenames
      return `/icons/png/avatars/${cleanIconUrl}.png`;
    }

    // Support legacy 3-digit format by converting to 4-digit
    if (cleanIconUrl.match(/^avatar_\d{3}$/)) {
      const num = cleanIconUrl.replace('avatar_', '');
      const paddedNum = num.padStart(4, '0');
      return `/icons/png/avatars/avatar_${paddedNum}.png`;
    }

    // For filenames that already have .png extension, use them directly
    if (cleanIconUrl.match(/\.png$/)) {
      return `/icons/png/avatars/${cleanIconUrl}`;
    }

    return cleanIconUrl;
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
      <div
        className={cn(
          'flex items-center justify-center rounded-lg overflow-hidden flex-shrink-0',
          sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md,
          className
        )}
        style={{
          minWidth: size === 'card' ? '50px' : size === 'list' ? '30px' : undefined,
          minHeight: size === 'card' ? '50px' : size === 'list' ? '30px' : undefined,
          maxWidth: size === 'card' ? '50px' : size === 'list' ? '30px' : undefined,
          maxHeight: size === 'card' ? '50px' : size === 'list' ? '30px' : undefined,
        }}
      >
        <img
          src={iconUrl}
          alt={name}
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== fallbackAvatar) {
              target.src = fallbackAvatar;
            } else {
              // If fallback also fails, show emoji
              target.style.display = 'none';
              if (target.parentNode) {
                const fallback = document.createElement('span');
                fallback.textContent = '🤖';
                fallback.className = 'text-2xl';
                target.parentNode.appendChild(fallback);
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
      sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md,
      className
    )}>
      <span className={cn(
        'text-center',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
        size === 'xl' && 'text-lg',
        size === '2xl' && 'text-2xl',
        size === 'list' && 'text-xs',
        size === 'card' && 'text-sm'
      )}>
        {avatar || '🤖'}
      </span>
    </div>
  );
}
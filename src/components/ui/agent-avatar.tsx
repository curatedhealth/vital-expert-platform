import { type Agent } from '@/lib/stores/chat-store';
import { cn } from '@/lib/utils';

// Support both old and new interfaces for backward compatibility
interface AgentAvatarProps {
  agent?: Agent;
  avatar?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

export function AgentAvatar({ agent, avatar: avatarProp, name: nameProp, size = 'md', className }: AgentAvatarProps) {
  // Support both old and new interfaces
  const avatar = agent?.avatar || avatarProp || '🤖';
  const name = agent?.name || nameProp || 'Agent';

  // Check if avatar is a file path or URL
  const isImagePath = avatar && (avatar.startsWith('/') || avatar.startsWith('http'));

  if (isImagePath) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-lg overflow-hidden bg-white border border-gray-200',
        sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md,
        className
      )}>
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to a default emoji if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.parentNode) {
              const fallback = document.createElement('span');
              fallback.textContent = '🤖';
              fallback.className = 'text-2xl';
              target.parentNode.appendChild(fallback);
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
        size === 'xl' && 'text-lg'
      )}>
        {avatar || '🤖'}
      </span>
    </div>
  );
}
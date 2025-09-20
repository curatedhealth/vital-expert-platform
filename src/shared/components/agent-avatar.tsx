import { cn } from '@/lib/utils';
import { type Agent } from '@/lib/stores/chat-store';

// Support both old and new interfaces for backward compatibility
interface AgentAvatarProps {
  agent?: Agent;
  avatar?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

export function AgentAvatar({ agent, avatar: avatarProp, name: nameProp, size = 'md', className }: AgentAvatarProps) {
  // Support both old and new interfaces
  const avatar = agent?.avatar || avatarProp || '🤖';
  const name = agent?.name || nameProp || 'Agent';

  // Check if avatar is a file path or URL
  const isImagePath = avatar && (avatar.startsWith('/') || avatar.startsWith('http'));

  if (isImagePath) {
    return (
      <img
        src={avatar}
        alt={name}
        className={cn('rounded-sm object-contain', sizeClasses[size], className)}
        onError={(e) => {
          // Fallback to a default emoji if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentNode?.appendChild(document.createTextNode('🤖'));
        }}
      />
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
        size === 'xl' && 'text-lg'
      )}>
        {avatar || '🤖'}
      </span>
    </div>
  );
}
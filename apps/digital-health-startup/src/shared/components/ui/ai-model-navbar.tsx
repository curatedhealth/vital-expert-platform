'use client';

import {
  Brain,
  ChevronDown,
  MessageSquare,
  Zap,
  Star,
  Settings,
  User,
  LogOut,
  Plus,
  History,
  Sparkles,
  Bot,
  Monitor,
  Gauge,
  Users,
  UserCheck,
  ImageIcon,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/shared/components/ui/dropdown-menu';
import { ModelConfig, AVAILABLE_MODELS, useModelSelection } from '@/shared/components/ui/model-selector';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/services/utils';

// 🎯 AI Model Navbar Props
interface AIModelNavbarProps {
  className?: string;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  onNewChat?: () => void;
  onSignOut?: () => void;
  showUserMenu?: boolean;
  showQuickActions?: boolean;
}

// 🔧 Model Provider Icons

  switch (provider) {
    case 'openai':
      return '🤖';
    case 'anthropic':
      return '🧠';
    case 'google':
      return '🔍';
    case 'meta':
      return '📘';
    case 'huggingface':
      return '🤗';
    default:
      return '⚡';
  }
};

// 🎨 Model Status Badge

  switch (status) {
    case 'stable':
      return <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">Stable</Badge>;
    case 'preview':
      return <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">Preview</Badge>;
    case 'deprecated':
      return <Badge variant="outline" className="text-gray-700 border-gray-300 bg-gray-50">Legacy</Badge>;
    default:
      return null;
  }
};

// 📊 Capability Rating Stars

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3 w-3",
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
};

// 🚀 Enhanced Model Selector Dropdown

  const { selectedModel, currentModel, handleModelChange } = useModelSelection();
  const [isOpen, setIsOpen] = useState(false);

    // eslint-disable-next-line security/detect-object-injection
    if (!acc[model.provider]) {
      // eslint-disable-next-line security/detect-object-injection
      acc[model.provider] = [];
    }
    // eslint-disable-next-line security/detect-object-injection
    acc[model.provider].push(model);
    return acc;
  }, { /* TODO: implement */ } as Record<string, ModelConfig[]>);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 min-w-[240px] justify-between bg-white hover:bg-gray-50 border-gray-300"
        >
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line security/detect-object-injection */}
            <span className="text-lg">{getProviderIcon(currentModel.provider)}</span>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{currentModel.name}</span>
              <span className="text-xs text-gray-500 truncate max-w-[120px]">
                {currentModel.description}
              </span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Select AI Model
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose the best model for your pharmaceutical intelligence needs
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {/* eslint-disable-next-line security/detect-object-injection */}
          {Object.entries(groupedModels).map(([provider, models]) => (
            <div key={provider} className="p-2">
              <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                {/* eslint-disable-next-line security/detect-object-injection */}
                {getProviderIcon(provider)} {provider}
              </div>
              <div className="space-y-1">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      handleModelChange(model.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full p-3 text-left rounded-lg transition-colors hover:bg-gray-50",
                      selectedModel === model.id && "bg-blue-50 border border-blue-200"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{model.name}</span>
                          <ModelStatusBadge status={model.status} />
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {model.description}
                        </p>

                        {/* Capabilities */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Brain className="h-3 w-3 text-purple-500" />
                            <span className="text-gray-500">Logic</span>
                            <CapabilityRating rating={model.capabilities.reasoning} />
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            <span className="text-gray-500">Speed</span>
                            <CapabilityRating rating={model.capabilities.speed} />
                          </div>
                          <div className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-pink-500" />
                            <span className="text-gray-500">Creative</span>
                            <CapabilityRating rating={model.capabilities.creativity} />
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {model.features.slice(0, 3).map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs px-1.5 py-0.5">
                              {feature}
                            </Badge>
                          ))}
                          {model.features.length > 3 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              +{model.features.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>${model.pricing.input}/M input</span>
                          <span>•</span>
                          <span>${model.pricing.output}/M output</span>
                          <span>•</span>
                          <span>{model.contextLength.toLocaleString()} tokens</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Monitor className="h-3 w-3" />
            <span>Model performance varies by task complexity</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// 👤 User Menu Dropdown

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name?.split(' ').map((n: any) => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <History className="mr-2 h-4 w-4" />
            <span>Chat History</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// 🎯 Main AI Model Navbar Component
export const AIModelNavbar: React.FC<AIModelNavbarProps> = ({
  className,
  user,
  onNewChat,
  onSignOut,
  showUserMenu = true,
  showQuickActions = true,
}) => {

    onNewChat?.();
    router.push('/chat');
  };

    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">VITAL AI</span>
            </Link>
          </div>

          {/* Center Section - Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/chat">
              <Button
                variant={isActivePath('/chat') ? 'secondary' : 'ghost'}
                className="h-9"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask Expert
              </Button>
            </Link>
            <Link href="/ask-panel">
              <Button
                variant={isActivePath('/ask-panel') ? 'secondary' : 'ghost'}
                className="h-9"
              >
                <Users className="mr-2 h-4 w-4" />
                Ask Panel
              </Button>
            </Link>
            <Link href="/ask-team">
              <Button
                variant={isActivePath('/ask-team') ? 'secondary' : 'ghost'}
                className="h-9"
              >
                <Users className="mr-2 h-4 w-4" />
                Ask Team
              </Button>
            </Link>
            <Link href="/ask-panel-enhanced">
              <Button
                variant={isActivePath('/ask-panel-enhanced') ? 'secondary' : 'ghost'}
                className="h-9"
              >
                <Brain className="mr-2 h-4 w-4" />
                AI Panel
                <Badge variant="secondary" className="ml-1 text-xs">Enhanced</Badge>
              </Button>
            </Link>
            <Link href="/agents">
              <Button
                variant={isActivePath('/agents') ? 'secondary' : 'ghost'}
                className="h-9"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Agents
              </Button>
            </Link>
            <Link href="/icons">
              <Button
                variant={isActivePath('/icons') ? 'secondary' : 'ghost'}
                className="h-9"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Icons
              </Button>
            </Link>
            <Link href="/knowledge">
              <Button
                variant={isActivePath('/knowledge') ? 'secondary' : 'ghost'}
                className="h-9"
              >
                <Brain className="mr-2 h-4 w-4" />
                Knowledge
              </Button>
            </Link>
            <Link href="/prompts">
              <Button
                variant={isActivePath('/prompts') ? 'secondary' : 'ghost'}
                className="h-9"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                PRISM™
              </Button>
            </Link>
            <Link href="/dashboard/capabilities">
              <Button
                variant={isActivePath('/dashboard/capabilities') ? 'secondary' : 'ghost'}
                className="h-9"
              >
                <Settings className="mr-2 h-4 w-4" />
                Capabilities
              </Button>
            </Link>
            <Link href="/solution-builder">
              <Button
                variant={isActivePath('/solution-builder') ? 'secondary' : 'ghost'}
                className="h-9"
              >
                <Target className="mr-2 h-4 w-4" />
                Build Solution
              </Button>
            </Link>
          </div>

          {/* Right Section - Quick Actions & User Menu */}
          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            {showQuickActions && (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewChat}
                  className="h-9"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Consultation
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9">
                      <Gauge className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <History className="mr-2 h-4 w-4" />
                      Recent Chats
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Model Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Monitor className="mr-2 h-4 w-4" />
                      Performance
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* User Menu */}
            {showUserMenu && <UserMenuDropdown user={user} onSignOut={onSignOut} />}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AIModelNavbar;
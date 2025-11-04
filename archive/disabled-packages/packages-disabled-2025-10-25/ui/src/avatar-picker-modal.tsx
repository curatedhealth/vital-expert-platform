'use client';

import { X, Search, User, Grid, List } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IconService, type Icon } from '@/lib/services/icon-service';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (icon: Icon) => void;
  selectedAvatar?: string;
  title?: string;
  description?: string;
}

export function AvatarPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedAvatar,
  title = 'Choose Avatar',
  description = 'Select an avatar for your agent'
}: AvatarPickerModalProps) {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [filteredIcons, setFilteredIcons] = useState<Icon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const iconService = new IconService();

  // Get unique categories from icons
  const categories = ['all', ...Array.from(new Set(icons.map(icon => icon.subcategory || icon.category).filter(Boolean)))];

  useEffect(() => {
    if (isOpen) {
      loadIcons();
    }
  }, [isOpen]);

  useEffect(() => {
    filterIcons();
  }, [icons, searchQuery, selectedCategory]);

  const loadIcons = async () => {
    setLoading(true);
    try {
      const loadedIcons = await iconService.getAvatarIcons();
      setIcons(loadedIcons);
    } catch (error) {
      console.error('Error loading avatars:', error);
      setIcons([]);
    } finally {
      setLoading(false);
    }
  };

  const filterIcons = () => {
    let filtered = icons;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(icon =>
        icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        icon.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (icon.tags && icon.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(icon => 
        icon.subcategory === selectedCategory || icon.category === selectedCategory
      );
    }

    setFilteredIcons(filtered);
  };

  const handleAvatarSelect = (icon: Icon) => {
    onSelect(icon);
    onClose();
  };

  const renderAvatar = (icon: Icon) => {
    const isBase64 = icon.file_url && icon.file_url.startsWith('data:image/');
    const isImagePath = icon.file_url && (icon.file_url.startsWith('/') || icon.file_url.startsWith('http'));

    if (isBase64 || isImagePath) {
      return (
        <Image
          src={icon.file_url}
          alt={icon.display_name}
          width={viewMode === 'grid' ? 48 : 32}
          height={viewMode === 'grid' ? 48 : 32}
          className="object-cover rounded-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentNode as HTMLElement;
            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl">👤</div>';
          }}
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center text-2xl">
        {icon.file_url || '👤'}
      </div>
    );
  };

  const isSelected = (icon: Icon) => {
    return selectedAvatar === icon.id || selectedAvatar === icon.file_url;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              {title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search avatars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters and View Mode */}
          <div className="flex items-center justify-between">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <div className="flex gap-1">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="h-8 text-xs"
                  >
                    {category === 'all' ? 'All' : category}
                  </Button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Avatars Grid/List */}
        <div className="p-4 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <div className="text-gray-500">Loading avatars...</div>
              </div>
            </div>
          ) : filteredIcons.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500">
                  {searchQuery ? 'No avatars found matching your search.' : 'No avatars available.'}
                </div>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3' 
              : 'space-y-2'
            }>
              {filteredIcons.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => handleAvatarSelect(icon)}
                  className={`
                    ${viewMode === 'grid' 
                      ? 'w-16 h-16 rounded-full border-2 flex items-center justify-center overflow-hidden' 
                      : 'w-full flex items-center gap-3 p-3 rounded-lg border-2 hover:bg-gray-50'
                    }
                    transition-all duration-200 hover:scale-105 hover:shadow-md
                    ${isSelected(icon)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  title={icon.display_name}
                >
                  {viewMode === 'grid' ? (
                    renderAvatar(icon)
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
                        {renderAvatar(icon)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm text-gray-900">{icon.display_name}</div>
                        <div className="text-xs text-gray-500">{icon.subcategory || icon.category}</div>
                        {icon.tags && icon.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {icon.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {filteredIcons.length} avatar{filteredIcons.length !== 1 ? 's' : ''} available
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

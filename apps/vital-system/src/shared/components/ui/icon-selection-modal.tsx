'use client';

import { X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@vital/ui';
import { Input } from '@vital/ui';
import { type Icon } from '@/shared/services/icon-service';

import { OptimizedIconRenderer } from './optimized-icon-renderer';

interface IconSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (icon: Icon) => void;
  selectedIcon?: string;
  category?: 'avatar' | 'prompt' | 'process' | 'medical' | 'regulatory' | 'general';
}

export function IconSelectionModal({
  isOpen,
  onClose,
  onSelect,
  selectedIcon,
  category = 'avatar'
}: IconSelectionModalProps) {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [filteredIcons, setFilteredIcons] = useState<Icon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadIcons();
    }
  }, [isOpen, category]);

  useEffect(() => {
    filterIcons();
  }, [icons, searchQuery]);

  const loadIcons = async () => {
    setLoading(true);
    try {
      let loadedIcons: Icon[] = [];

      // Use direct API calls for reliable icon loading
      const response = await fetch(`/api/icons?category=${category}`);
      const data = await response.json();

      if (data.success && data.icons) {
        loadedIcons = data.icons;
        console.log(`Loaded ${loadedIcons.length} icons for category ${category}`);
        console.log('Sample icon URLs:', loadedIcons.slice(0, 3).map((i: any) => i.file_url));
      } else {
        console.warn('No icons returned from API');
      }

      setIcons(loadedIcons);
    } catch (error) {
      console.error('Error loading icons:', error);
      setIcons([]);
    } finally {
      setLoading(false);
    }
  };

  const filterIcons = () => {
    if (!searchQuery) {
      setFilteredIcons(icons);
      return;
    }

    const filtered = icons.filter(icon =>
      icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (icon.tags && icon.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
    setFilteredIcons(filtered);
  };

  const handleIconSelect = (icon: Icon) => {
    onSelect(icon);
    onClose();
  };

  const getIconUrl = (icon: Icon) => {
    // For avatars, use the icon field which contains Supabase Storage URL
    // For other icons, use file_url if available
    return icon.icon || icon.file_url;
  };

  const getIconUrlOld = (icon: Icon) => {
    if (icon.file_url && category === 'avatar') {
      // For avatars, use hash-based consistent assignment
      const hashStringToNumber = (url: string) => {
        let hash = 0;
        for (let i = 0; i < url.length; i++) {
          const char = url.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        // Use available avatar files: avatar_001.png through avatar_061.png (61 total)
        return Math.abs(hash % 61) + 1;
      };

      const avatarNumber = hashStringToNumber(icon.file_url);
      const avatarFilename = `avatar_${avatarNumber.toString().padStart(3, '0')}.png`;
      return `/icons/png/avatars/${avatarFilename}`;
    }

    // For non-avatar categories, keep existing logic
    if (icon.file_url && category !== 'avatar') {

      if (localPngFilename) {
        return `/icons/png/${iconCategory}/${localPngFilename}`;
      }
    }

    return icon.file_url;
  };

  // Removed renderIcon function - now using OptimizedIconRenderer component

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-neutral-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Choose Icon</h2>
            <p className="text-sm text-neutral-500">Select an icon for your {category}</p>
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

        {/* Search */}
        <div className="p-4 border-b border-neutral-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
            <Input
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Icons Grid */}
        <div className="p-4 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-neutral-500">Loading icons...</div>
            </div>
          ) : filteredIcons.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-neutral-500">
                {searchQuery ? 'No icons found matching your search.' : 'No icons available.'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-3">
              {filteredIcons.map((icon) => (
                <div
                  key={icon.id}
                  className={`
                    w-12 h-12 rounded-lg border-2
                    transition-all duration-200 hover:scale-105 hover:shadow-md
                    ${selectedIcon === (icon.icon || icon.file_url)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                    }
                  `}
                  title={icon.display_name}
                >
                  <OptimizedIconRenderer
                    icon={icon}
                    size={48}
                    onClick={() => handleIconSelect(icon)}
                    isSelected={selectedIcon === (icon.icon || icon.file_url)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
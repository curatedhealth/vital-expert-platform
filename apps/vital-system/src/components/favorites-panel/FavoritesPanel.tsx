/**
 * Favorites Panel Component
 * Display and manage user's favorite workflows and templates
 * 
 * Features:
 * - List favorited items
 * - Filter by type (workflows, templates)
 * - Remove from favorites
 * - Quick actions
 */

'use client';

import { useState, useEffect } from 'react';
import { Heart, Trash2, Eye, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog as AlertDialog,
  DialogContent as AlertDialogContent,
  DialogDescription as AlertDialogDescription,
  DialogFooter as AlertDialogFooter,
  DialogHeader as AlertDialogHeader,
  DialogTitle as AlertDialogTitle,
} from '@/components/ui/dialog';

// AlertDialogAction and AlertDialogCancel don't exist in Dialog, use Button instead
const AlertDialogAction = Button;
const AlertDialogCancel = Button;

interface Favorite {
  id: string;
  user_id: string;
  favoritable_type: 'workflow' | 'template' | 'node';
  favoritable_id: string;
  favoritable_name: string;
  favoritable_slug: string | null;
  display_name: string | null;
  description: string | null;
  thumbnail_url: string | null;
  category: string | null;
  tags: string[] | null;
  created_at: string;
}

interface FavoritesPanelProps {
  onViewItem?: (favorite: Favorite) => void;
  onLoadItem?: (favorite: Favorite) => void;
  onRemoveFavorite?: (favoriteId: string) => void;
  className?: string;
}

export function FavoritesPanel({ 
  onViewItem, 
  onLoadItem,
  onRemoveFavorite,
  className = '' 
}: FavoritesPanelProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/favorites');
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      // Update local state
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));

      if (onRemoveFavorite) {
        onRemoveFavorite(favoriteId);
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedFavorite(null);
    }
  };

  const handleViewItem = (favorite: Favorite) => {
    if (onViewItem) {
      onViewItem(favorite);
    }
  };

  const handleLoadItem = (favorite: Favorite) => {
    if (onLoadItem) {
      onLoadItem(favorite);
    }
  };

  const filteredFavorites = favorites.filter(favorite => {
    if (selectedType === 'all') return true;
    return favorite.favoritable_type === selectedType;
  });

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 ${className}`}>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Favorites</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={fetchFavorites}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Heart className="h-8 w-8 fill-red-500 text-red-500" />
          My Favorites
        </h2>
        <p className="text-muted-foreground">
          Quickly access your favorite workflows, templates, and nodes
        </p>
      </div>

      {/* Type Tabs */}
      <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="workflow">
            Workflows ({favorites.filter(f => f.favoritable_type === 'workflow').length})
          </TabsTrigger>
          <TabsTrigger value="template">
            Templates ({favorites.filter(f => f.favoritable_type === 'template').length})
          </TabsTrigger>
          <TabsTrigger value="node">
            Nodes ({favorites.filter(f => f.favoritable_type === 'node').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Favorites List */}
      {filteredFavorites.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground">
              {selectedType === 'all'
                ? 'Start favoriting workflows, templates, and nodes to see them here'
                : `You haven't favorited any ${selectedType}s yet`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFavorites.map((favorite) => (
            <Card
              key={favorite.id}
              className="group hover:shadow-md transition-shadow relative"
            >
              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setSelectedFavorite(favorite);
                  setDeleteDialogOpen(true);
                }}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>

              <CardHeader className="pb-3">
                <div className="flex items-start gap-2">
                  <Heart className="h-4 w-4 fill-red-500 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {favorite.display_name || favorite.favoritable_name}
                    </CardTitle>
                    {favorite.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {favorite.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Type Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {favorite.favoritable_type}
                  </Badge>
                  {favorite.category && (
                    <Badge variant="outline">{favorite.category}</Badge>
                  )}
                </div>

                {/* Tags */}
                {favorite.tags && favorite.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {favorite.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {favorite.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{favorite.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Date Added */}
                <p className="text-xs text-muted-foreground">
                  Added {new Date(favorite.created_at).toLocaleDateString()}
                </p>
              </CardContent>

              <CardFooter className="gap-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewItem(favorite)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleLoadItem(favorite)}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Load
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Favorites?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{selectedFavorite?.display_name || selectedFavorite?.favoritable_name}" from your favorites?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedFavorite(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedFavorite && handleRemoveFavorite(selectedFavorite.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


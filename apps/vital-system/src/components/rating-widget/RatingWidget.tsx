/**
 * Rating Widget Component
 * Display and submit ratings for workflows and templates
 * 
 * Features:
 * - Star rating display
 * - Interactive star selection
 * - Rating statistics
 * - Submit ratings
 * - View rating distribution
 */

'use client';

import { useState, useEffect } from 'react';
import { Star, StarHalf, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface RatingWidgetProps {
  ratableType: 'workflow' | 'template' | 'node';
  ratableId: string;
  ratableName?: string;
  currentRating?: number;
  ratingCount?: number;
  userRating?: number;
  onRatingSubmit?: (rating: number, review?: string) => void;
  showReviewInput?: boolean;
  showDistribution?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
}

export function RatingWidget({
  ratableType,
  ratableId,
  ratableName,
  currentRating = 0,
  ratingCount = 0,
  userRating,
  onRatingSubmit,
  showReviewInput = true,
  showDistribution = false,
  size = 'md',
  interactive = true,
  className = '',
}: RatingWidgetProps) {
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(userRating || 0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [distribution, setDistribution] = useState<Record<number, number>>({});

  useEffect(() => {
    if (showDistribution) {
      fetchRatingDistribution();
    }
  }, [ratableId, showDistribution]);

  const fetchRatingDistribution = async () => {
    try {
      const response = await fetch(
        `/api/ratings?ratable_type=${ratableType}&ratable_id=${ratableId}&distribution=true`
      );
      if (response.ok) {
        const data = await response.json();
        setDistribution(data.distribution || {});
      }
    } catch (err) {
      console.error('Error fetching rating distribution:', err);
    }
  };

  const handleRatingClick = (rating: number) => {
    if (!interactive) return;
    setSelectedRating(rating);
    setDialogOpen(showReviewInput);
    
    if (!showReviewInput && onRatingSubmit) {
      handleSubmit(rating);
    }
  };

  const handleSubmit = async (rating: number = selectedRating, reviewText?: string) => {
    try {
      setSubmitting(true);

      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ratable_type: ratableType,
          ratable_id: ratableId,
          rating_value: rating,
          review_text: reviewText || review || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      if (onRatingSubmit) {
        onRatingSubmit(rating, reviewText || review || undefined);
      }

      setDialogOpen(false);
      setReview('');
    } catch (err) {
      console.error('Error submitting rating:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const displayRating = interactive ? (hoveredRating || selectedRating || currentRating) : currentRating;
    const stars = [];

    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(displayRating);
      const isHalf = i === Math.ceil(displayRating) && displayRating % 1 !== 0;
      const isHovered = interactive && hoveredRating >= i;
      const isSelected = interactive && selectedRating >= i;

      stars.push(
        <button
          key={i}
          type="button"
          className={cn(
            'transition-all',
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
            sizeClasses[size]
          )}
          onMouseEnter={() => interactive && setHoveredRating(i)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
          onClick={() => handleRatingClick(i)}
          disabled={!interactive}
        >
          {isFilled || isHovered || isSelected ? (
            <Star className={cn(
              sizeClasses[size],
              'fill-yellow-400 text-yellow-400'
            )} />
          ) : isHalf ? (
            <StarHalf className={cn(
              sizeClasses[size],
              'fill-yellow-400 text-yellow-400'
            )} />
          ) : (
            <Star className={cn(
              sizeClasses[size],
              'text-neutral-300'
            )} />
          )}
        </button>
      );
    }

    return stars;
  };

  const renderDistribution = () => {
    if (!showDistribution || Object.keys(distribution).length === 0) {
      return null;
    }

    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

    return (
      <div className="space-y-2 mt-4">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = distribution[stars] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={stars} className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 w-12">
                <span className="font-medium">{stars}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="text-muted-foreground w-12 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className={cn('flex items-center gap-2', className)}>
        {/* Stars */}
        <div className="flex items-center gap-1">
          {renderStars()}
        </div>

        {/* Rating Info */}
        {currentRating > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{currentRating.toFixed(1)}</span>
            {ratingCount > 0 && (
              <span>({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})</span>
            )}
          </div>
        )}

        {/* User Rating Indicator */}
        {userRating && userRating > 0 && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <ThumbsUp className="h-3 w-3" />
            <span>You rated {userRating}</span>
          </div>
        )}
      </div>

      {/* Rating Distribution */}
      {showDistribution && renderDistribution()}

      {/* Review Dialog */}
      {showReviewInput && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rate {ratableName || 'this item'}</DialogTitle>
              <DialogDescription>
                Share your experience to help others make informed decisions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Star Selection */}
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center gap-1">
                  {renderStars()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedRating === 0 && 'Select a rating'}
                  {selectedRating === 1 && 'Poor'}
                  {selectedRating === 2 && 'Fair'}
                  {selectedRating === 3 && 'Good'}
                  {selectedRating === 4 && 'Very Good'}
                  {selectedRating === 5 && 'Excellent'}
                </p>
              </div>

              {/* Review Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Review (Optional)
                </label>
                <Textarea
                  placeholder="Share your thoughts about this workflow..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {review.length}/500
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSubmit()}
                disabled={selectedRating === 0 || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

/**
 * Compact Rating Display (Read-only)
 */
interface RatingDisplayProps {
  rating: number;
  count?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingDisplay({
  rating,
  count = 0,
  showCount = true,
  size = 'sm',
  className = '',
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Star className={cn(
        sizeClasses[size],
        'fill-yellow-400 text-yellow-400'
      )} />
      <span className={cn('font-medium', textSizes[size])}>
        {rating.toFixed(1)}
      </span>
      {showCount && count > 0 && (
        <span className={cn('text-muted-foreground', textSizes[size])}>
          ({count})
        </span>
      )}
    </div>
  );
}


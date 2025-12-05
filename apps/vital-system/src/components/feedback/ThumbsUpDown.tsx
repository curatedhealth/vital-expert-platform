'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface ThumbsUpDownProps {
  messageId: string;
  queryText: string;
  responseText: string;
  agentId?: string;
  onFeedbackSubmitted?: (feedback: FeedbackData) => void;
}

interface FeedbackData {
  messageId: string;
  vote: 'up' | 'down';
  rating?: number;
  category?: string;
  comment?: string;
}

export function ThumbsUpDown({
  messageId,
  queryText,
  responseText,
  agentId,
  onFeedbackSubmitted,
}: ThumbsUpDownProps) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [category, setCategory] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (newVote: 'up' | 'down') => {
    if (vote === newVote) {
      // Unvote
      setVote(null);
      setShowDetailedForm(false);
      return;
    }

    setVote(newVote);

    // If thumbs down, show detailed form
    if (newVote === 'down') {
      setShowDetailedForm(true);
    } else {
      // Thumbs up: submit immediately with default rating
      await submitFeedback(newVote, 5);
    }
  };

  const submitFeedback = async (
    feedbackVote: 'up' | 'down',
    feedbackRating?: number,
    feedbackCategory?: string,
    feedbackComment?: string
  ) => {
    setIsSubmitting(true);

    try {
      const feedbackData: FeedbackData = {
        messageId,
        vote: feedbackVote,
        rating: feedbackRating,
        category: feedbackCategory,
        comment: feedbackComment,
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feedbackData,
          queryText,
          responseText,
          agentId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      onFeedbackSubmitted?.(feedbackData);

      // Close detailed form if open
      if (showDetailedForm) {
        setTimeout(() => {
          setShowDetailedForm(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Reset vote on error
      setVote(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitFeedback(vote!, rating || 1, category, comment);
  };

  return (
    <div className="feedback-container">
      {/* Quick Vote Buttons */}
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => handleVote('up')}
          disabled={isSubmitting}
          className={`p-2 rounded-lg transition-all ${
            vote === 'up'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Thumbs up"
        >
          <ThumbsUp className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleVote('down')}
          disabled={isSubmitting}
          className={`p-2 rounded-lg transition-all ${
            vote === 'down'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Thumbs down"
        >
          <ThumbsDown className="w-4 h-4" />
        </button>

        {vote && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2">
            {isSubmitting ? 'Submitting...' : 'Thanks for your feedback!'}
          </span>
        )}
      </div>

      {/* Detailed Feedback Form (shown on thumbs down) */}
      {showDetailedForm && vote === 'down' && (
        <form
          onSubmit={handleDetailedSubmit}
          className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700"
        >
          <h4 className="text-sm font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
            Help us improve
          </h4>

          {/* Star Rating */}
          <div className="mb-3">
            <label className="block text-xs text-neutral-700 dark:text-neutral-300 mb-1">
              Rate this response (1-5 stars)
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating
                      ? 'text-yellow-500'
                      : 'text-neutral-300 dark:text-neutral-600'
                  } hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Issue Category */}
          <div className="mb-3">
            <label
              htmlFor="feedback-category"
              className="block text-xs text-neutral-700 dark:text-neutral-300 mb-1"
            >
              What went wrong?
            </label>
            <select
              id="feedback-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
            >
              <option value="">Select an issue</option>
              <option value="irrelevant">Response was irrelevant</option>
              <option value="incomplete">Response was incomplete</option>
              <option value="inaccurate">Response was inaccurate</option>
              <option value="confusing">Response was confusing</option>
              <option value="sources">Missing or poor sources</option>
              <option value="hallucination">Possible hallucination</option>
              <option value="slow">Response was too slow</option>
              <option value="other">Other issue</option>
            </select>
          </div>

          {/* Additional Comments */}
          <div className="mb-3">
            <label
              htmlFor="feedback-comment"
              className="block text-xs text-neutral-700 dark:text-neutral-300 mb-1"
            >
              Additional details (optional)
            </label>
            <textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about what could be improved..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      )}
    </div>
  );
}

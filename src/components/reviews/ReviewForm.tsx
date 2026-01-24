'use client';

import { useState } from 'react';
import { Button, Label } from '@/components/ui';
import { Star, Loader2, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  bookingId: string;
  accommodationName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ bookingId, accommodationName, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Molimo izaberite ocenu');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Greška pri slanju recenzije');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri slanju recenzije');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-lg font-semibold">Hvala na recenziji!</h3>
        <p className="mt-2 text-foreground-muted">
          Vaša recenzija je uspešno sačuvana.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Ocenite vaš boravak</h3>
        <p className="text-sm text-foreground-muted">{accommodationName}</p>
      </div>

      {/* Star Rating */}
      <div className="space-y-2">
        <Label>Vaša ocena *</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  (hoverRating || rating) >= star
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground'
                )}
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-foreground-muted">
          {rating === 1 && 'Loše'}
          {rating === 2 && 'Ispod proseka'}
          {rating === 3 && 'Prosečno'}
          {rating === 4 && 'Dobro'}
          {rating === 5 && 'Odlično'}
        </p>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">Komentar (opciono)</Label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Podelite vaše iskustvo sa ostalim korisnicima..."
          className="min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={1000}
        />
        <p className="text-xs text-foreground-muted text-right">
          {comment.length}/1000
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            <X className="mr-2 h-4 w-4" />
            Otkaži
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || rating === 0} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Slanje...
            </>
          ) : (
            'Pošalji recenziju'
          )}
        </Button>
      </div>
    </form>
  );
}

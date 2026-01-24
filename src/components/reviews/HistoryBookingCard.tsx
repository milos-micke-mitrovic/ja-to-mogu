'use client';

import { useState } from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { Calendar, MapPin, Star, Package, MessageSquarePlus } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ReviewForm } from './ReviewForm';

interface Booking {
  id: string;
  status: string;
  totalPrice: number;
  arrivalDate: string;
  duration: string;
  packageType: string;
  accommodation: {
    name: string;
    address: string;
  };
  review: {
    rating: number;
  } | null;
}

interface HistoryBookingCardProps {
  booking: Booking;
  translations: {
    bonusPackage: string;
    basicPackage: string;
  };
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'COMPLETED':
      return { label: 'Završeno', color: 'bg-success/10 text-success' };
    case 'CANCELLED':
      return { label: 'Otkazano', color: 'bg-error/10 text-error' };
    case 'NO_SHOW':
      return { label: 'Nije se pojavio', color: 'bg-warning/10 text-warning' };
    default:
      return { label: status, color: 'bg-muted text-foreground-muted' };
  }
}

function getDurationLabel(duration: string) {
  switch (duration) {
    case 'TWO_THREE':
      return '2-3 dana';
    case 'FOUR_SEVEN':
      return '4-7 dana';
    case 'EIGHT_TEN':
      return '8-10 dana';
    case 'TEN_PLUS':
      return '10+ dana';
    default:
      return duration;
  }
}

export function HistoryBookingCard({ booking, translations }: HistoryBookingCardProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasReview, setHasReview] = useState(!!booking.review);
  const [reviewRating] = useState(booking.review?.rating || 0);

  const statusBadge = getStatusBadge(booking.status);
  const canReview = booking.status === 'COMPLETED' && !hasReview;

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setHasReview(true);
    // We don't know the rating immediately, but we can refresh the page
    window.location.reload();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{booking.accommodation.name}</h3>
              <p className="text-sm text-foreground-muted">{booking.accommodation.address}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(booking.arrivalDate)}
                </span>
                <span>{getDurationLabel(booking.duration)}</span>
                <span className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {booking.packageType === 'BONUS' ? translations.bonusPackage : translations.basicPackage}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:flex-col sm:items-end">
            {/* Status Badge */}
            <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusBadge.color)}>
              {statusBadge.label}
            </span>

            {/* Rating or Review Button */}
            {hasReview ? (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-4 w-4',
                      star <= reviewRating
                        ? 'fill-primary text-primary'
                        : 'text-muted'
                    )}
                  />
                ))}
              </div>
            ) : canReview ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReviewForm(true)}
                className="gap-2"
              >
                <MessageSquarePlus className="h-4 w-4" />
                Ostavi recenziju
              </Button>
            ) : null}

            {/* Price */}
            <div className="text-right">
              <p className="font-semibold text-primary">
                {formatPrice(booking.totalPrice)}
              </p>
              <p className="text-xs text-foreground-muted">Ukupno</p>
            </div>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="mt-6 border-t border-border pt-6">
            <ReviewForm
              bookingId={booking.id}
              accommodationName={booking.accommodation.name}
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

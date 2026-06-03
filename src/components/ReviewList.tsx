'use client';

import { StarIcon } from '@phosphor-icons/react';
import type { Review } from '@/lib/api/reviews';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ReviewListProps {
  reviews: Review[];
  avgRating: number | null;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-right text-gray-600 font-medium">{stars}</span>
      <StarIcon className="w-3.5 h-3.5 fill-[var(--secondary)] text-[var(--secondary)]" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--secondary)] rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs text-gray-400">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">
                {review.user?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {review.user?.name || 'Food Saver'}
              </p>
              <p className="text-xs text-gray-400">{date}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= review.rating
                    ? 'fill-[var(--secondary)] text-[var(--secondary)]'
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        {review.comment && (
          <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
        )}
        {review.imageUrl && (
          <div className="mt-2">
            <img
              src={review.imageUrl}
              alt="Review photo"
              className="w-20 h-20 object-cover rounded-xl border border-gray-100"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReviewList({
  reviews,
  avgRating,
  totalReviews,
  ratingDistribution,
  loading,
  error,
  hasMore,
  onLoadMore,
}: ReviewListProps) {
  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-24 bg-gray-100 rounded-2xl" />
        <div className="h-24 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  const total = totalReviews;

  return (
    <div className="space-y-4">
      {/* Rating summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl font-bold text-gray-900">
            {avgRating !== null ? avgRating.toFixed(1) : '-'}
          </div>
          <div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-4 h-4 ${
                    avgRating !== null && star <= Math.round(avgRating)
                      ? 'fill-[var(--secondary)] text-[var(--secondary)]'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{total} ulasan</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((stars) => (
            <RatingBar
              key={stars}
              stars={stars}
              count={ratingDistribution[stars] || 0}
              total={total}
            />
          ))}
        </div>
      </div>

      {/* Review cards */}
      {reviews.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm">Belum ada ulasan untuk produk ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="w-full py-3 bg-gray-50 text-[var(--primary)] text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors"
        >
          {loading ? 'Memuat...' : 'Lihat Ulasan Lainnya'}
        </button>
      )}
    </div>
  );
}

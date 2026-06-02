'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchProductReviews,
  createReview as apiCreateReview,
  type Review,
  type ProductReviewsResponse,
  type CreateReviewInput,
} from '@/lib/api/reviews';

interface UseReviewsReturn {
  reviews: Review[];
  avgRating: number | null;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  loadMore: () => void;
  submitReview: (orderId: string, input: CreateReviewInput) => Promise<Review>;
}

export function useReviews(productId: string): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(async (pageNum: number) => {
    if (!productId) return;
    try {
      setLoading(true);
      setError(null);
      const data: ProductReviewsResponse = await fetchProductReviews(productId, pageNum, 10);

      if (pageNum === 1) {
        setReviews(data.reviews);
      } else {
        setReviews((prev) => [...prev, ...data.reviews]);
      }

      setAvgRating(data.avgRating);
      setTotalReviews(data.totalReviews);
      setRatingDistribution(data.ratingDistribution);
      setPage(pageNum);
      setHasMore(data.reviews.length === 10 && data.pagination.total > pageNum * 10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat ulasan');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load(1);
  }, [load]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      load(page + 1);
    }
  }, [loading, hasMore, page, load]);

  const submitReview = useCallback(async (orderId: string, input: CreateReviewInput) => {
    const res = await apiCreateReview(orderId, input);
    // Refresh reviews after submission
    load(1);
    return res.review;
  }, [load]);

  return {
    reviews,
    avgRating,
    totalReviews,
    ratingDistribution,
    loading,
    error,
    page,
    hasMore,
    loadMore,
    submitReview,
  };
}

import { apiFetch } from './client';

export interface ReviewUser {
  name: string;
  email: string;
}

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  imageUrl: string | null;
  createdAt: string;
  user?: ReviewUser;
}

export interface ProductReviewsResponse {
  reviews: Review[];
  avgRating: number | null;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  pagination: { page: number; limit: number; total: number };
}

export interface CreateReviewInput {
  rating: number;
  comment?: string;
  imageUrl?: string;
}

export async function fetchProductReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<ProductReviewsResponse> {
  return apiFetch<ProductReviewsResponse>(
    `/reviews/products/${productId}/reviews?page=${page}&limit=${limit}`,
    { auth: true }
  );
}

export async function createReview(
  orderId: string,
  input: CreateReviewInput
): Promise<{ review: Review }> {
  return apiFetch<{ review: Review }>(`/reviews/orders/${orderId}/review`, {
    method: 'POST',
    body: JSON.stringify(input),
    auth: true,
  });
}

export interface MitraReviewsResponse {
  reviews: (Review & { product?: { id: string; name: string } })[];
  avgRating: number | null;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  pagination: { page: number; limit: number; total: number };
}

export async function fetchMitraReviews(
  mitraId: string,
  page = 1,
  limit = 10
): Promise<MitraReviewsResponse> {
  return apiFetch<MitraReviewsResponse>(
    `/reviews/mitra/${mitraId}/reviews?page=${page}&limit=${limit}`,
    { auth: true }
  );
}

export interface TrustBadge {
  label: string;
  icon: string;
}

export async function fetchTrustBadges(productId: string): Promise<{ badges: TrustBadge[] }> {
  return apiFetch<{ badges: TrustBadge[] }>(`/reviews/products/${productId}/trust-badges`, {
    auth: true,
  });
}

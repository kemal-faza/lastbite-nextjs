export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: UserResponse;
}

export interface ApiError {
  error: string;
  code: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string | null;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  /** Computed: Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) */
  discountPercent: number;
  stock: number;
  imageUrl: string | null;
  storeName: string;
  storeAddress: string | null;
  storeLat: number | null;
  storeLng: number | null;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductListResponse extends PaginatedResponse {
  totalPages: number;
}

export interface ProductSearchResponse extends PaginatedResponse {
  query: string;
}

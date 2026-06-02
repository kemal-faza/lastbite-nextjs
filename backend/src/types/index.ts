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

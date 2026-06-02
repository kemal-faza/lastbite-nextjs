import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-not-for-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-not-for-production',
  jwtAccessExpiry: '15m' as const,
  jwtRefreshExpiry: '7d' as const,
  otpExpiryMinutes: 5,
  otpLength: 6,
  bcryptSaltRounds: 12,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
} as const;

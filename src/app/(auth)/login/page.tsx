'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye as EyeIcon, EyeClosed as EyeClosedIcon, CaretLeft as CaretLeftIcon, ForkKnife as ForkKnifeIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginFormSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function isValidReturnUrl(url: string): boolean {
  // Must start with /
  if (!url.startsWith('/')) return false;
  // Must not contain :// (protocol injection)
  if (url.includes('://')) return false;
  // Must not contain // (protocol-relative URL attack)
  if (url.includes('//')) return false;
  // Must not contain @ (credential injection)
  if (url.includes('@')) return false;
  return true;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const justVerified = searchParams.get('verified') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setServerError('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (!res.ok) {
        if (body.code === 'ACCOUNT_NOT_VERIFIED') {
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
          return;
        }
        setServerError(body.error || 'Login gagal. Periksa email dan password Anda.');
        return;
      }

      localStorage.setItem('accessToken', body.tokens.accessToken);
      localStorage.setItem('refreshToken', body.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(body.user));

      // Set role cookie (non-HTTP-only, readable by middleware)
      const role = body.user.role;
      document.cookie = `user-role=${role}; path=/; max-age=86400; SameSite=Lax`;

      const returnUrl = searchParams.get('returnUrl');
      if (returnUrl && isValidReturnUrl(returnUrl)) {
        router.push(returnUrl);
      } else if (role === 'ADMIN') {
        router.push('/admin');
      } else if (role === 'MITRA') {
        router.push('/seller');
      } else {
        router.push('/');
      }
    } catch {
      setServerError('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <div className="px-4 pt-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm"
        >
          <CaretLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8 pb-10 max-w-md mx-auto w-full">
        {justVerified && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100">
            <p className="text-sm text-green-700 text-center">
              Akun berhasil diverifikasi! Silakan masuk.
            </p>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ForkKnifeIcon className="w-6 h-6 text-[var(--primary)]" />
            <span className="text-lg font-bold text-[var(--primary)]">LastBite</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Selamat Datang Kembali</h1>
          <p className="text-sm text-gray-500 mt-1">
            Masuk untuk melanjutkan berburu makanan surplus
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
            <p className="text-sm text-[var(--destructive)]">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              className="mt-1.5"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-[var(--destructive)] mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeClosedIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[var(--destructive)] mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-[var(--primary)] hover:bg-[#0d5558] text-white font-medium py-3 rounded-xl"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-[var(--primary)] font-medium">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

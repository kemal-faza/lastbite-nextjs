'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, ChevronLeft, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const registerFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setServerError('');

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          name: data.name,
          phone: data.phone || undefined,
          password: data.password,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setServerError(body.error || 'Registrasi gagal. Silakan coba lagi.');
        return;
      }

      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
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
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8 pb-10 max-w-md mx-auto w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="w-6 h-6 text-[var(--primary)]" />
            <span className="text-lg font-bold text-[var(--primary)]">LastBite</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Akun Baru</h1>
          <p className="text-sm text-gray-500 mt-1">
            Mulai hemat dan kurangi food waste bersama LastBite
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
            <p className="text-sm text-[var(--destructive)]">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              placeholder="Nadia Putri"
              className="mt-1.5"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-[var(--destructive)] mt-1">{errors.name.message}</p>
            )}
          </div>

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
            <Label htmlFor="phone">Nomor Telepon (opsional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="08123456789"
              className="mt-1.5"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-xs text-[var(--destructive)] mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[var(--destructive)] mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Masukkan ulang password"
              className="mt-1.5"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-[var(--destructive)] mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-[var(--primary)] hover:bg-[#0d5558] text-white font-medium py-3 rounded-xl"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {isSubmitting ? 'Mendaftarkan...' : 'Daftar'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-[var(--primary)] font-medium">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

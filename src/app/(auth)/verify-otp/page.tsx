'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CaretLeft as CaretLeftIcon, Envelope as EnvelopeIcon } from '@phosphor-icons/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const RESEND_COOLDOWN_SECONDS = 30;

function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = useCallback(async (otpCode: string) => {
    if (otpCode.length !== 6) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body.error || 'Verifikasi gagal');
        setCode('');
        return;
      }

      router.push('/login?verified=true');
    } catch {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, router]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (code.length === 6 && !isSubmitting) {
      const timer = setTimeout(() => handleVerify(code), 300);
      return () => clearTimeout(timer);
    }
  }, [code, isSubmitting, handleVerify]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendMessage('');
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body.error || 'Gagal mengirim ulang kode');
        return;
      }

      setResendMessage('Kode baru telah dikirim!');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError('Tidak dapat terhubung ke server.');
    }
  };

  const handleDigitInput = (digit: string) => {
    if (code.length >= 6 || isSubmitting) return;
    const newCode = code + digit;
    setCode(newCode);
  };

  const handleDelete = () => {
    setCode((prev) => prev.slice(0, -1));
  };

  if (!email) return null;

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

      <div className="flex-1 flex flex-col items-center px-6 pt-8 pb-10 max-w-md mx-auto w-full">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <EnvelopeIcon className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verifikasi Email</h1>
          <p className="text-sm text-gray-500 mt-2">
            Masukkan 6 digit kode yang telah dikirim ke{' '}
            <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        {error && (
          <div className="w-full mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
            <p className="text-sm text-[var(--destructive)] text-center">{error}</p>
          </div>
        )}

        {resendMessage && (
          <div className="w-full mb-4 p-3 rounded-xl bg-green-50 border border-green-100">
            <p className="text-sm text-green-700 text-center">{resendMessage}</p>
          </div>
        )}

        {/* OTP Display */}
        <div className="flex gap-3 mb-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-colors ${
                code[i]
                  ? 'border-[var(--primary)] bg-white text-gray-900'
                  : 'border-gray-200 bg-white text-gray-300'
              } ${isSubmitting ? 'opacity-50' : ''}`}
            >
              {code[i] || ''}
            </div>
          ))}
        </div>

        {isSubmitting && (
          <p className="text-sm text-gray-400 mt-2">Memverifikasi...</p>
        )}

        {/* Custom Number Pad */}
        <div className="grid grid-cols-3 gap-3 mt-8 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigitInput(num.toString())}
              disabled={code.length >= 6 || isSubmitting}
              className="h-14 rounded-xl bg-white border border-gray-200 text-xl font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-40"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigitInput('0')}
            disabled={code.length >= 6 || isSubmitting}
            className="h-14 rounded-xl bg-white border border-gray-200 text-xl font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-40"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={code.length === 0 || isSubmitting}
            className="h-14 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-40"
          >
            Hapus
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Tidak menerima kode?{' '}
            {resendCooldown > 0 ? (
              <span className="text-gray-400">Kirim ulang dalam {resendCooldown}s</span>
            ) : (
              <button
                onClick={handleResend}
                className="text-[var(--primary)] font-medium hover:underline"
              >
                Kirim Ulang
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OtpForm />
    </Suspense>
  );
}

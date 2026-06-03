'use client';

import { useState, useCallback } from 'react';
import { StarIcon, PaperPlaneRightIcon } from '@phosphor-icons/react';
import type { CreateReviewInput } from '@/lib/api/reviews';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  productName: string;
  onSubmit: (orderId: string, input: CreateReviewInput) => Promise<void>;
}

export function WriteReviewModal({
  isOpen,
  onClose,
  orderId,
  productName,
  onSubmit,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (rating === 0) {
      setError('Pilih rating terlebih dahulu');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(orderId, {
        rating,
        comment: comment.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim ulasan');
    } finally {
      setSubmitting(false);
    }
  }, [rating, comment, orderId, onSubmit, onClose]);

  return (
    <Sheet open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Tulis Ulasan</SheetTitle>
        </SheetHeader>

        <p className="text-sm text-gray-500 mb-4">{productName}</p>

        {/* Star rating */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <StarIcon
                className={`w-10 h-10 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-[var(--secondary)] text-[var(--secondary)]'
                    : 'text-gray-200'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mb-4">
          {rating === 0 ? 'Ketuk bintang untuk memberi rating' : `Rating kamu: ${rating} bintang`}
        </p>

        {/* Comment textarea */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ceritakan pengalamanmu dengan produk ini... (opsional)"
          maxLength={1000}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] resize-none"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/1000</p>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className={`w-full mt-4 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
            rating === 0 || submitting
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 active:scale-[0.98]'
          }`}
        >
          <PaperPlaneRightIcon className="w-5 h-5" />
          {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
        </button>
      </SheetContent>
    </Sheet>
  );
}

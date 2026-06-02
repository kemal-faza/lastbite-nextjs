'use client';

import { useState, useCallback } from 'react';
import { X, Star, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CreateReviewInput } from '@/lib/api/reviews';

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Tulis Ulasan</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

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
                  <Star
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
              <Send className="w-5 h-5" />
              {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

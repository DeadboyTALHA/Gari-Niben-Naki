'use client';
import { useState } from 'react';
import { reviewsApi } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ReviewModalProps {
  bookingId:  number;
  vehicleName: string;    // e.g. 'Toyota Corolla 2022' — shown in the modal title
  isOpen:     boolean;
  onClose:    () => void;
  onSubmitted: () => void; // called after successful submit so parent can update UI
}

export default function ReviewModal({
  bookingId,
  vehicleName,
  isOpen,
  onClose,
  onSubmitted,
}: ReviewModalProps) {
  const [rating,  setRating]  = useState(0);   // 0 means nothing selected yet
  const [hovered, setHovered] = useState(0);   // which star the mouse is over
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Labels shown below the stars as the user hovers
  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    setLoading(true);
    try {
      await reviewsApi.create({
        booking_id: bookingId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success('Review submitted — thank you!');
      onSubmitted();   // tell the parent to hide the Leave Review button
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  // Reset state when modal is closed so it's fresh next time
  const handleClose = () => {
    setRating(0);
    setHovered(0);
    setComment('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Review: ${vehicleName}`}
      size='sm'
    >
      <div className='space-y-5'>

        {/* ── Star picker ─────────────────────────────── */}
        <div>
          <p className='text-sm font-medium text-gray-700 mb-3'>
            How would you rate this car?
          </p>

          {/* Five star buttons */}
          <div className='flex gap-2 justify-center'>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type='button'
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className='transition-transform hover:scale-110 focus:outline-none'
                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              >
                <svg
                  className={`h-10 w-10 transition-colors
                    ${(hovered || rating) >= star
                      ? 'text-amber-400 fill-current'
                      : 'text-gray-300 fill-current'}
                  `}
                  viewBox='0 0 24 24'
                >
                  <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12
                    17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                </svg>
              </button>
            ))}
          </div>

          {/* Rating label */}
          <p className='text-center text-sm font-medium mt-2 h-5
                       text-amber-600 transition-all'>
            {ratingLabels[hovered || rating]}
          </p>
        </div>

        {/* ── Comment box ─────────────────────────────── */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Comment <span className='text-gray-400 font-normal'>(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder='Tell others about your experience with this car...'
            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       outline-none resize-none'
          />
          <p className='text-xs text-gray-400 text-right mt-1'>
            {comment.length}/500
          </p>
        </div>

        {/* ── Action buttons ──────────────────────────── */}
        <div className='flex gap-3'>
          <Button variant='secondary' onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            fullWidth
            loading={loading}
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            Submit Review
          </Button>
        </div>
      </div>
    </Modal>
  );
}
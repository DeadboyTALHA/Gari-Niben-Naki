'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Review } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ReviewsList({ vehicleId }: { vehicleId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/reviews/vehicle/${vehicleId}`)
      .then(res => setReviews(res.data.reviews))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [vehicleId]);

  if (loading) return <div className='h-20 bg-gray-100 animate-pulse rounded-xl' />;

  return (
    <div>
      <h2 className='text-xl font-bold text-gray-800 mb-4'>
        Reviews ({reviews.length})
      </h2>
      {reviews.length === 0 ? (
        <p className='text-gray-400 text-sm'>No reviews yet. Be the first to rent this car!</p>
      ) : (
        <div className='space-y-4'>
          {reviews.map(r => (
            <div key={r.id} className='border border-gray-100 rounded-xl p-4'>
              <div className='flex items-center justify-between mb-1'>
                <div className='flex text-amber-400 text-sm'>
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </div>
                <span className='text-xs text-gray-400'>{formatDate(r.created_at)}</span>
              </div>
              {r.comment && <p className='text-gray-600 text-sm mt-1'>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
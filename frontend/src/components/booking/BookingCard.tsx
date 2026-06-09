import { useState } from 'react';
import { Booking } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import ReviewModal from '@/components/booking/ReviewModal';
import { Calendar, Car, CheckCircle } from 'lucide-react';

interface BookingCardProps {
  booking:   Booking;
  onCancel?: (id: number) => void;
}

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const [reviewOpen, setReviewOpen]   = useState(false);
  const [reviewed,   setReviewed]     = useState(false);

  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const canReview = booking.status === 'completed' && !reviewed;

  // Build a readable car name from the nested vehicle object if available
  const vehicleName = booking.vehicle
    ? `${booking.vehicle.brand} ${booking.vehicle.model} ${booking.vehicle.year}`
    : `Vehicle #${booking.vehicle_id}`;

  return (
    <>
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5
                     hover:shadow-md transition-shadow'>
        <div className='flex items-start justify-between flex-wrap gap-3'>

          {/* Left: car name + dates */}
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <Car className='h-4 w-4 text-blue-700' />
              <span className='font-semibold text-gray-800'>{vehicleName}</span>
            </div>
            <p className='text-xs text-gray-400 mb-2'>
              Ref: {booking.booking_ref}
            </p>
            <div className='flex items-center gap-1.5 text-sm text-gray-500'>
              <Calendar className='h-4 w-4' />
              {formatDate(booking.pickup_date)}
              <span className='text-gray-300 mx-0.5'>→</span>
              {formatDate(booking.return_date)}
              <span className='text-gray-400 ml-1'>({booking.days} days)</span>
            </div>
          </div>

          {/* Right: amount + status */}
          <div className='text-right'>
            <p className='font-bold text-gray-900 text-lg'>
              {formatCurrency(booking.total_amount)}
            </p>
            <StatusBadge status={booking.status} />
          </div>
        </div>

        {/* Action buttons */}
        <div className='flex gap-2 mt-4 pt-4 border-t border-gray-50 flex-wrap'>
          {canCancel && onCancel && (
            <Button variant='danger' size='sm'
              onClick={() => onCancel(booking.id)}>
              Cancel Booking
            </Button>
          )}

          {canReview && (
            <Button variant='outline' size='sm'
              onClick={() => setReviewOpen(true)}>
              Leave Review
            </Button>
          )}

          {/* After submitting, show a 'Reviewed' badge instead */}
          {reviewed && (
            <span className='flex items-center gap-1 text-green-700
                            text-sm font-medium'>
              <CheckCircle className='h-4 w-4' />
              Reviewed
            </span>
          )}
        </div>
      </div>

      {/* Review modal — rendered outside the card div */}
      <ReviewModal
        bookingId={booking.id}
        vehicleName={vehicleName}
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmitted={() => setReviewed(true)}
      />
    </>
  );
}
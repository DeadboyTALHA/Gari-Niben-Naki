import { Booking } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { Calendar, Car } from 'lucide-react';

interface BookingCardProps {
  booking:   Booking;
  onCancel?: (id: number) => void;
  onReview?: (id: number) => void;
}

export default function BookingCard({ booking, onCancel, onReview }: BookingCardProps) {
  const canCancel = ['pending','confirmed'].includes(booking.status);
  const canReview = booking.status === 'completed';

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5
                   hover:shadow-md transition-shadow'>
      <div className='flex items-start justify-between flex-wrap gap-3'>
        <div>
          <div className='flex items-center gap-2 mb-1'>
            <Car className='h-4 w-4 text-blue-700' />
            <span className='font-semibold text-gray-800'>
              {booking.vehicle?.brand} {booking.vehicle?.model ?? `Vehicle #${booking.vehicle_id}`}
            </span>
          </div>
          <p className='text-xs text-gray-400 mb-2'>Ref: {booking.booking_ref}</p>
          <div className='flex items-center gap-1 text-sm text-gray-500'>
            <Calendar className='h-4 w-4' />
            {formatDate(booking.pickup_date)} → {formatDate(booking.return_date)}
            <span className='ml-1 text-gray-400'>({booking.days} days)</span>
          </div>
        </div>
        <div className='text-right'>
          <p className='font-bold text-gray-900 text-lg'>{formatCurrency(booking.total_amount)}</p>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {/* Actions */}
      <div className='flex gap-2 mt-4 pt-4 border-t border-gray-50'>
        {canCancel && onCancel && (
          <Button variant='danger' size='sm'
            onClick={() => onCancel(booking.id)}>
            Cancel
          </Button>
        )}
        {canReview && onReview && (
          <Button variant='outline' size='sm'
            onClick={() => onReview(booking.id)}>
            Leave Review
          </Button>
        )}
      </div>
    </div>
  );
}
'use client';
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { bookingsApi } from '@/lib/api';
import { Booking } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Calendar, Car, User, DollarSign } from 'lucide-react';
import Link from 'next/link';

// Tab definitions — each maps to a booking status filter
const TABS = [
  { label: 'Upcoming',  status: 'confirmed' },
  { label: 'Active',    status: 'active'    },
  { label: 'All',       status: ''          },
  { label: 'Completed', status: 'completed' },
  { label: 'Cancelled', status: 'cancelled' },
];

export default function OwnerBookingsPage() {
  useRequireAuth(['owner', 'both', 'admin']);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState(0);

  useEffect(() => {
    setLoading(true);
    const status = TABS[tab].status || undefined;
    bookingsApi.ownerBookings(status)
      .then(res => {
        setBookings(res.data.bookings);
        setTotal(res.data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className='max-w-5xl mx-auto px-4 py-8'>

      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Incoming Bookings</h1>
          <p className='text-gray-500 mt-1'>
            {total} booking{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href='/owner/dashboard'
          className='text-sm text-gray-500 hover:text-gray-700'
        >
          ← Dashboard
        </Link>
      </div>

      {/* Tab bar */}
      <div className='flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto'>
        {TABS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition
              ${tab === i
                ? 'bg-white shadow text-blue-700'
                : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner message='Loading bookings...' />
      ) : bookings.length === 0 ? (
        <div className='text-center py-16 bg-gray-50 rounded-2xl'>
          <Car className='h-12 w-12 text-gray-200 mx-auto mb-3' />
          <p className='text-gray-400 font-medium'>
            No {TABS[tab].label.toLowerCase()} bookings
          </p>
          <p className='text-gray-400 text-sm mt-1'>
            Bookings will appear here once customers rent your cars.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {bookings.map(booking => (
            <OwnerBookingRow key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Single booking row card ───────────────────────────────
function OwnerBookingRow({ booking }: { booking: Booking }) {
  // Calculate how many days until pickup
  const daysUntilPickup = Math.ceil(
    (new Date(booking.pickup_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const urgency =
    daysUntilPickup <= 1 ? 'border-red-200 bg-red-50' :
    daysUntilPickup <= 3 ? 'border-orange-200 bg-orange-50' :
    'border-gray-100 bg-white';

  return (
    <div className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition ${urgency}`}>
      <div className='flex flex-wrap items-start justify-between gap-4'>

        {/* Left: car + dates */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Car className='h-4 w-4 text-blue-700' />
            <span className='font-semibold text-gray-800'>
              {booking.vehicle?.brand ?? 'Vehicle'} {booking.vehicle?.model ?? ''} {booking.vehicle?.year ?? ''}
            </span>
            <StatusBadge status={booking.status} />
          </div>

          <div className='flex items-center gap-1.5 text-sm text-gray-500'>
            <Calendar className='h-4 w-4' />
            <span>
              {formatDate(booking.pickup_date)}
              <span className='mx-1 text-gray-300'>→</span>
              {formatDate(booking.return_date)}
            </span>
            <span className='text-gray-400'>({booking.days} days)</span>
          </div>

          {/* Pickup urgency label */}
          {booking.status === 'confirmed' && daysUntilPickup >= 0 && (
            <p className={`text-xs font-medium
              ${daysUntilPickup <= 1 ? 'text-red-600' :
                daysUntilPickup <= 3 ? 'text-orange-600' : 'text-gray-400'}
            `}>
              {daysUntilPickup === 0
                ? 'Pickup is TODAY'
                : daysUntilPickup === 1
                ? 'Pickup is TOMORROW'
                : `Pickup in ${daysUntilPickup} days`}
            </p>
          )}
        </div>

        {/* Right: earnings + booking ref */}
        <div className='text-right'>
          <div className='flex items-center gap-1 justify-end text-green-700 font-bold text-lg'>
            <DollarSign className='h-4 w-4' />
            {formatCurrency(booking.total_amount * 0.9)}
            {/* Owner gets 90% — platform takes 10% service fee */}
          </div>
          <p className='text-xs text-gray-400 mt-0.5'>
            Your earnings (after 10% fee)
          </p>
          <p className='font-mono text-xs text-gray-400 mt-1'>
            {booking.booking_ref}
          </p>
        </div>
      </div>
    </div>
  );
}
'use client';
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { bookingsApi } from '@/lib/api';
import { Booking, BookingStatus } from '@/types';
import BookingCard from '@/components/booking/BookingCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const TABS: { label: string; status: BookingStatus | 'all' }[] = [
  { label:'All',       status:'all'       },
  { label:'Active',    status:'active'    },
  { label:'Upcoming',  status:'confirmed' },
  { label:'Completed', status:'completed' },
  { label:'Cancelled', status:'cancelled' },
];

export default function MyBookingsPage() {
  useRequireAuth(['customer','both']);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<BookingStatus | 'all'>('all');

  useEffect(() => {
    setLoading(true);
    bookingsApi.myBookings(tab === 'all' ? undefined : tab)
      .then(res => setBookings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab]);

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingsApi.cancel(id);
      setBookings(prev => prev.map(b => b.id===id ? {...b,status:'cancelled'} : b));
      toast.success('Booking cancelled');
    } catch { toast.error('Cancellation failed'); }
  };

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold text-gray-900 mb-6'>My Bookings</h1>

      {/* Tab bar */}
      <div className='flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto'>
        {TABS.map(t => (
          <button key={t.status}
            onClick={() => setTab(t.status)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition
              ${tab === t.status ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : bookings.length === 0 ? (
        <div className='text-center py-16 text-gray-400'>
          <p className='text-lg'>No {tab === 'all' ? '' : tab} bookings found.</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {bookings.map(b => (
            <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
}
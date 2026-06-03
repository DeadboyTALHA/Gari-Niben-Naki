'use client';
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { bookingsApi } from '@/lib/api';
import { Booking } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import BookingCard from '@/components/booking/BookingCard';
import StatsCard from '@/components/dashboard/StatsCard';
import { Car, Calendar, DollarSign, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CustomerDashboard() {
  const { user } = useRequireAuth(['customer','both']);
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    bookingsApi.myBookings()
      .then(res => setBookings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this booking? This may be subject to a cancellation fee.')) return;
    try {
      await bookingsApi.cancel(id);
      setBookings(prev => prev.map(b =>
        b.id === id ? { ...b, status: 'cancelled' as any } : b
      ));
      toast.success('Booking cancelled');
    } catch {
      toast.error('Failed to cancel booking');
    }
  };

  if (loading) return <LoadingSpinner message='Loading your dashboard...' />;

  const active    = bookings.filter(b => b.status === 'active');
  const upcoming  = bookings.filter(b => b.status === 'confirmed');
  const completed = bookings.filter(b => b.status === 'completed');
  const totalSpent= completed.reduce((s, b) => s + b.total_amount, 0);

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>
          Welcome back, {user?.full_name?.split(' ')[0]}!
        </h1>
        <p className='text-gray-500 mt-1'>Here is a summary of your activity.</p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <StatsCard title='Active Rentals'  value={active.length}
          icon={<Car className='h-5 w-5'/>}          color='blue' />
        <StatsCard title='Upcoming'        value={upcoming.length}
          icon={<Calendar className='h-5 w-5'/>}     color='purple' />
        <StatsCard title='Completed Trips' value={completed.length}
          icon={<Clock className='h-5 w-5'/>}        color='green' />
        <StatsCard title='Total Spent'     value={formatCurrency(totalSpent)}
          icon={<DollarSign className='h-5 w-5'/>}   color='orange' />
      </div>

      {/* Active rentals */}
      {active.length > 0 && (
        <section className='mb-8'>
          <h2 className='text-xl font-bold text-gray-800 mb-4'>Active Rentals</h2>
          <div className='space-y-4'>
            {active.map(b => (
              <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className='mb-8'>
          <h2 className='text-xl font-bold text-gray-800 mb-4'>Upcoming Bookings</h2>
          <div className='space-y-4'>
            {upcoming.map(b => (
              <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {bookings.length === 0 && (
        <div className='text-center py-20 bg-gray-50 rounded-2xl'>
          <Car className='h-16 w-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-xl font-semibold text-gray-500 mb-2'>No bookings yet</h3>
          <p className='text-gray-400 mb-6'>Start by browsing available cars near you.</p>
          <Link href='/cars'
            className='bg-blue-700 text-white px-6 py-3 rounded-xl hover:bg-blue-800 transition'>
            Browse Cars
          </Link>
        </div>
      )}
    </div>
  );
}
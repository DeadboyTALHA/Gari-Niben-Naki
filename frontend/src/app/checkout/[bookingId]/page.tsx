'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Booking } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function CheckoutPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  useRequireAuth();
  const router = useRouter();
  const [booking, setBooking]   = useState<Booking | null>(null);
  const [loading, setLoading]   = useState(true);
  const [paying, setPaying]     = useState(false);
  const [agreed, setAgreed]     = useState(false);

  useEffect(() => {
    api.get(`/bookings/${bookingId}`)
      .then(res => setBooking(res.data))
      .catch(() => toast.error('Booking not found'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePay = async () => {
    if (!agreed) { toast.error('Please agree to the terms'); return; }
    setPaying(true);
    try {
      // Create a Stripe PaymentIntent
      const res = await api.post('/payments/create-intent', { booking_id: Number(bookingId) });
      const { client_secret } = res.data;
      // NOTE: In production you would now use Stripe.js to show a card form.
      // For testing, we simulate a successful payment.
      toast.success('Payment processed! (Test mode - no real charge)');
      router.push('/dashboard/bookings');
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <LoadingSpinner message='Loading checkout...' />;
  if (!booking) return <div className='text-center py-20 text-gray-500'>Booking not found</div>;

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold text-gray-900 mb-6'>Checkout</h1>
      <div className='grid md:grid-cols-2 gap-8'>

        {/* Summary */}
        <div className='bg-white rounded-2xl shadow-sm p-6 space-y-4'>
          <h2 className='font-bold text-gray-800 text-lg'>Booking Summary</h2>
          <div className='text-sm space-y-2 text-gray-600'>
            <div className='flex justify-between'><span>Reference</span>
              <span className='font-mono'>{booking.booking_ref}</span></div>
            <div className='flex justify-between'><span>Pickup</span>
              <span>{formatDate(booking.pickup_date)}</span></div>
            <div className='flex justify-between'><span>Return</span>
              <span>{formatDate(booking.return_date)}</span></div>
            <div className='flex justify-between'><span>Duration</span>
              <span>{booking.days} days</span></div>
            <div className='border-t pt-2 space-y-1'>
              <div className='flex justify-between'><span>Subtotal</span>
                <span>{formatCurrency(booking.subtotal)}</span></div>
              <div className='flex justify-between'><span>Insurance</span>
                <span>{formatCurrency(booking.insurance_cost)}</span></div>
              <div className='flex justify-between'><span>Service fee</span>
                <span>{formatCurrency(booking.service_fee)}</span></div>
              <div className='flex justify-between'><span>Tax</span>
                <span>{formatCurrency(booking.tax)}</span></div>
              <div className='flex justify-between'><span>Security deposit</span>
                <span>{formatCurrency(booking.security_deposit)}</span></div>
            </div>
            <div className='flex justify-between font-bold text-gray-900 text-base border-t pt-2'>
              <span>Total</span><span>{formatCurrency(booking.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className='bg-white rounded-2xl shadow-sm p-6 space-y-4'>
          <h2 className='font-bold text-gray-800 text-lg'>Payment</h2>
          {/* Card form placeholder - integrate Stripe Elements here */}
          <div className='bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300 text-center text-sm text-gray-400'>
            <p>Stripe card form goes here.</p>
            <p className='mt-1'>See stripe.com/docs/stripe-js for integration guide.</p>
          </div>
          <label className='flex items-start gap-3 cursor-pointer'>
            <input type='checkbox' checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className='mt-1 text-blue-700 rounded'
            />
            <span className='text-sm text-gray-600'>
              I agree to the Terms & Conditions, Cancellation Policy,
              and confirm my driving license is valid.
            </span>
          </label>
          <Button fullWidth size='lg' loading={paying} onClick={handlePay} disabled={!agreed}>
            Pay {formatCurrency(booking.total_amount)}
          </Button>
        </div>
      </div>
    </div>
  );
}
'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useRequireAuth } from '@/hooks/useAuth';
import { api, paymentsApi } from '@/lib/api';
import { getStripe } from '@/lib/stripe';
import { Booking } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { ShieldCheck, CreditCard, Calendar, Car } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Stripe card input styling ─────────────────────────────
// These options control how the Stripe card fields look.
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#374151',
      fontFamily: 'Arial, sans-serif',
      '::placeholder': { color: '#9CA3AF' },
    },
    invalid: { color: '#DC2626' },
  },
};

// ── Inner form component (must be inside <Elements>) ─────
function PaymentForm({
  booking,
  onSuccess,
}: {
  booking: Booking;
  onSuccess: () => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [paying, setPaying]   = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [cardError, setCardError] = useState('');

  const handlePay = async () => {
    if (!stripe || !elements) {
      toast.error('Stripe has not loaded yet — please wait a moment');
      return;
    }
    if (!agreed) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setPaying(true);
    setCardError('');

    try {
      // Step 1: Ask your backend to create a PaymentIntent
      const intentRes = await paymentsApi.createIntent(booking.id);
      const { client_secret } = intentRes.data;

      // Step 2: Send card details directly to Stripe
      // stripe.confirmCardPayment never sends card data to your backend
      const cardNumber = elements.getElement(CardNumberElement);
      if (!cardNumber) throw new Error('Card element not found');

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        client_secret,
        { payment_method: { card: cardNumber } },
      );

      if (error) {
        // Stripe returned a card error (wrong number, insufficient funds, etc.)
        setCardError(error.message ?? 'Payment failed');
        toast.error(error.message ?? 'Payment failed');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful! Your booking is confirmed.');
        onSuccess();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Payment failed — please try again');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className='space-y-5'>

      {/* Card number */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Card Number
        </label>
        <div className='border border-gray-300 rounded-lg px-4 py-3 bg-white
                       focus-within:ring-2 focus-within:ring-blue-500
                       focus-within:border-transparent transition'>
          <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Expiry + CVC side by side */}
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Expiry Date
          </label>
          <div className='border border-gray-300 rounded-lg px-4 py-3 bg-white
                         focus-within:ring-2 focus-within:ring-blue-500
                         focus-within:border-transparent transition'>
            <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            CVC
          </label>
          <div className='border border-gray-300 rounded-lg px-4 py-3 bg-white
                         focus-within:ring-2 focus-within:ring-blue-500
                         focus-within:border-transparent transition'>
            <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      {/* Card error message */}
      {cardError && (
        <p className='text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg'>
          {cardError}
        </p>
      )}

      {/* Test card hint */}
      <div className='bg-blue-50 border border-blue-100 rounded-lg px-4 py-3
                     text-sm text-blue-700'>
        <p className='font-semibold mb-1'>Test mode — use these fake card details:</p>
        <p>Card number: 4242 4242 4242 4242</p>
        <p>Expiry: any future date (e.g. 12/34) &nbsp; CVC: any 3 digits (e.g. 123)</p>
      </div>

      {/* Terms checkbox */}
      <label className='flex items-start gap-3 cursor-pointer'>
        <input
          type='checkbox'
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className='mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-700
                     focus:ring-blue-500'
        />
        <span className='text-sm text-gray-600 leading-relaxed'>
          I agree to the Terms &amp; Conditions and Cancellation Policy.
          I confirm my driving licence is valid.
        </span>
      </label>

      {/* Pay button */}
      <Button
        fullWidth
        size='lg'
        loading={paying}
        onClick={handlePay}
        disabled={!agreed || !stripe}
      >
        <CreditCard className='h-5 w-5' />
        Pay {formatCurrency(booking.total_amount)}
      </Button>

      {/* Security badge */}
      <div className='flex items-center justify-center gap-2 text-xs text-gray-400'>
        <ShieldCheck className='h-4 w-4 text-green-500' />
        Secured by Stripe — your card details are never stored on our servers
      </div>
    </div>
  );
}

// ── Outer page component ─────────────────────────────────
export default function CheckoutPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  useRequireAuth();
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/${bookingId}`)
      .then(res => setBooking(res.data))
      .catch(() => toast.error('Booking not found'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleSuccess = () => {
    // Wait 1.5 seconds so the toast is visible, then redirect
    setTimeout(() => router.push('/dashboard/bookings'), 1500);
  };

  if (loading) return <LoadingSpinner message='Loading checkout...' />;
  if (!booking) return (
    <div className='text-center py-20 text-gray-500'>Booking not found</div>
  );

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold text-gray-900 mb-8'>Complete Your Booking</h1>

      <div className='grid md:grid-cols-2 gap-8'>

        {/* ── Left: Booking summary ─────────────────────── */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6
                       space-y-4 h-fit'>
          <h2 className='font-bold text-gray-800 text-lg flex items-center gap-2'>
            <Car className='h-5 w-5 text-blue-700' />
            Booking Summary
          </h2>

          {/* Booking reference */}
          <div className='bg-blue-50 rounded-xl px-4 py-3'>
            <p className='text-xs text-blue-600 font-medium'>Booking Reference</p>
            <p className='font-mono font-bold text-blue-800 text-lg'>
              {booking.booking_ref}
            </p>
          </div>

          {/* Dates */}
          <div className='flex items-start gap-3 text-sm text-gray-600'>
            <Calendar className='h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0' />
            <div>
              <span className='font-medium'>Pickup:</span> {formatDate(booking.pickup_date)}
              <br />
              <span className='font-medium'>Return:</span> {formatDate(booking.return_date)}
              <br />
              <span className='text-gray-400'>{booking.days} day{booking.days !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Price breakdown */}
          <div className='border-t pt-4 space-y-2 text-sm'>
            {[
              [`${formatCurrency(booking.daily_rate)} × ${booking.days} days`, booking.subtotal],
              ['Insurance',       booking.insurance_cost],
              ['Service fee',     booking.service_fee],
              ['Tax (10%)',        booking.tax],
              ['Security deposit (refundable)', booking.security_deposit],
            ].map(([label, amount]) => (
              Number(amount) > 0 && (
                <div key={String(label)} className='flex justify-between text-gray-600'>
                  <span>{label}</span>
                  <span>{formatCurrency(Number(amount))}</span>
                </div>
              )
            ))}
            <div className='flex justify-between font-bold text-gray-900 text-base
                           pt-2 border-t'>
              <span>Total due today</span>
              <span>{formatCurrency(booking.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* ── Right: Payment form ───────────────────────── */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
          <h2 className='font-bold text-gray-800 text-lg mb-5 flex items-center gap-2'>
            <CreditCard className='h-5 w-5 text-blue-700' />
            Payment Details
          </h2>

          {/* Wrap the form in <Elements> which provides Stripe context */}
          <Elements stripe={getStripe()}>
            <PaymentForm booking={booking} onSuccess={handleSuccess} />
          </Elements>
        </div>
      </div>
    </div>
  );
}
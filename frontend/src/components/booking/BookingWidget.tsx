'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vehicle, InsuranceTier } from '@/types';
import { bookingsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const INSURANCE: Record<InsuranceTier, { label: string; pricePerDay: number }> = {
  basic:    { label: 'Basic (included)',   pricePerDay: 0  },
  standard: { label: 'Standard (+$10/day)', pricePerDay: 10 },
  premium:  { label: 'Premium (+$25/day)', pricePerDay: 25 },
};

export default function BookingWidget({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [pickup, setPickup]           = useState('');
  const [returnDate, setReturnDate]   = useState('');
  const [insurance, setInsurance]     = useState<InsuranceTier>('basic');
  const [loading, setLoading]         = useState(false);

  const days = pickup && returnDate
    ? Math.max(Math.ceil((new Date(returnDate).getTime() - new Date(pickup).getTime())
               / (1000 * 60 * 60 * 24)), 1)
    : 0;

  const subtotal      = days * vehicle.daily_rate;
  const insuranceCost = days * INSURANCE[insurance].pricePerDay;
  const serviceFee    = subtotal * 0.10;
  const tax           = (subtotal + insuranceCost + serviceFee) * 0.10;
  const total         = subtotal + insuranceCost + serviceFee + tax + vehicle.security_deposit;

  const handleBook = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!pickup || !returnDate) { toast.error('Please select dates'); return; }
    setLoading(true);
    try {
      const res = await bookingsApi.create({
        vehicle_id:     vehicle.id,
        pickup_date:    new Date(pickup).toISOString(),
        return_date:    new Date(returnDate).toISOString(),
        insurance_tier: insurance,
      });
      toast.success('Booking created!');
      router.push(`/checkout/${res.data.id}`);
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className='bg-white rounded-2xl shadow-lg p-6 sticky top-20 space-y-4'>
      <p className='text-2xl font-bold text-gray-800'>
        {formatCurrency(vehicle.daily_rate)}<span className='text-base font-normal text-gray-500'>/day</span>
      </p>

      {/* Date pickers */}
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='block text-xs font-medium text-gray-600 mb-1'>Pickup</label>
          <input type='date' min={today} value={pickup}
            onChange={e => setPickup(e.target.value)}
            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:ring-2 focus:ring-blue-500 outline-none'
          />
        </div>
        <div>
          <label className='block text-xs font-medium text-gray-600 mb-1'>Return</label>
          <input type='date' min={pickup || today} value={returnDate}
            onChange={e => setReturnDate(e.target.value)}
            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:ring-2 focus:ring-blue-500 outline-none'
          />
        </div>
      </div>

      {/* Insurance */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Insurance</label>
        <div className='space-y-1'>
          {(Object.entries(INSURANCE) as [InsuranceTier, any][]).map(([key, val]) => (
            <label key={key} className='flex items-center gap-2 cursor-pointer'>
              <input type='radio' name='insurance' value={key}
                checked={insurance === key} onChange={() => setInsurance(key)}
                className='text-blue-700' />
              <span className='text-sm text-gray-700'>{val.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price breakdown */}
      {days > 0 && (
        <div className='border-t pt-4 space-y-1.5 text-sm'>
          <div className='flex justify-between text-gray-600'>
            <span>{formatCurrency(vehicle.daily_rate)} x {days} days</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {insuranceCost > 0 && (
            <div className='flex justify-between text-gray-600'>
              <span>Insurance</span><span>{formatCurrency(insuranceCost)}</span>
            </div>
          )}
          <div className='flex justify-between text-gray-600'>
            <span>Service fee</span><span>{formatCurrency(serviceFee)}</span>
          </div>
          <div className='flex justify-between text-gray-600'>
            <span>Tax (10%)</span><span>{formatCurrency(tax)}</span>
          </div>
          {vehicle.security_deposit > 0 && (
            <div className='flex justify-between text-gray-600'>
              <span>Security deposit (refundable)</span>
              <span>{formatCurrency(vehicle.security_deposit)}</span>
            </div>
          )}
          <div className='flex justify-between font-bold text-gray-900 text-base pt-2 border-t'>
            <span>Total</span><span>{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      <Button fullWidth loading={loading} onClick={handleBook} size='lg'>
        {isAuthenticated ? 'Book Now' : 'Sign in to Book'}
      </Button>
    </div>
  );
}
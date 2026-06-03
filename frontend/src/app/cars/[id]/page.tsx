'use client';
import { use } from 'react';
import { Star, MapPin, Fuel, Users, Settings, Calendar } from 'lucide-react';
import { useVehicle } from '@/hooks/useVehicles';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import BookingWidget from '@/components/booking/BookingWidget';
import ReviewsList from '@/components/cars/ReviewsList';

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);  // Next.js 15: params is a Promise
  const { vehicle, loading, error } = useVehicle(Number(id));

  if (loading) return <LoadingSpinner message='Loading car details...' />;
  if (error || !vehicle) return (
    <div className='text-center py-20 text-gray-500'>{error ?? 'Car not found'}</div>
  );

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <div className='grid lg:grid-cols-3 gap-8'>

        {/* ── Left column (2/3 width) ─────────────────────── */}
        <div className='lg:col-span-2 space-y-6'>

          {/* Image placeholder */}
          <div className='h-72 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl
                         flex items-center justify-center text-8xl'>
            🚗
          </div>

          {/* Title + rating */}
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              {vehicle.brand} {vehicle.model} {vehicle.year}
            </h1>
            <div className='flex items-center gap-2 mt-1'>
              <div className='flex text-amber-400'>
                {'★'.repeat(Math.round(vehicle.average_rating))}
                {'☆'.repeat(5 - Math.round(vehicle.average_rating))}
              </div>
              <span className='text-gray-500 text-sm'>
                {vehicle.average_rating.toFixed(1)} ({vehicle.total_reviews} reviews)
              </span>
            </div>
          </div>

          {/* Specs grid */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            {[
              { icon:<Users className='h-5 w-5'/>,    label:'Seats',        val:vehicle.seats },
              { icon:<Fuel className='h-5 w-5'/>,     label:'Fuel',         val:vehicle.fuel_type },
              { icon:<Settings className='h-5 w-5'/>, label:'Transmission', val:vehicle.transmission },
              { icon:<MapPin className='h-5 w-5'/>,   label:'City',         val:vehicle.location_city ?? 'N/A' },
            ].map(spec => (
              <div key={spec.label}
                className='bg-gray-50 rounded-xl p-4 flex flex-col items-center gap-2 text-center'>
                <div className='text-blue-700'>{spec.icon}</div>
                <p className='text-xs text-gray-400 uppercase tracking-wide'>{spec.label}</p>
                <p className='font-semibold text-gray-800 capitalize'>{spec.val}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {vehicle.description && (
            <div>
              <h2 className='text-xl font-bold text-gray-800 mb-2'>About this car</h2>
              <p className='text-gray-600 leading-relaxed'>{vehicle.description}</p>
            </div>
          )}

          {/* Reviews */}
          <ReviewsList vehicleId={vehicle.id} />
        </div>

        {/* ── Right column: Booking widget ─────────────────── */}
        <div className='lg:col-span-1'>
          <BookingWidget vehicle={vehicle} />
        </div>
      </div>
    </div>
  );
}
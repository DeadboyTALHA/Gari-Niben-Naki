import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Users, Fuel } from 'lucide-react';
import { Vehicle } from '@/types';

interface CarCardProps {
  car: Vehicle;
}

export default function CarCard({ car }: CarCardProps) {
  // Find the primary image, or fall back to the first image, or null
  const primaryImage =
    car.images?.find(img => img.is_primary) ??
    car.images?.[0] ??
    null;

  return (
    <div className='bg-white rounded-xl shadow-md overflow-hidden
                   hover:shadow-xl transition-shadow duration-300 group'>

      {/* ── Image area ─────────────────────────────────── */}
      <div className='relative h-48 bg-gradient-to-br from-blue-50 to-blue-100'>
        {primaryImage ? (
          <Image
            src={primaryImage.image_url}
            alt={`${car.brand} ${car.model}`}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-300'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        ) : (
          // No photo uploaded yet — show a branded placeholder
          <div className='absolute inset-0 flex flex-col items-center
                         justify-center text-blue-300'>
            <svg className='h-16 w-16 mb-2' fill='none' viewBox='0 0 24 24'
                 stroke='currentColor' strokeWidth={1}>
              <path strokeLinecap='round' strokeLinejoin='round'
                d='M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0
                   014 0zM13 6H5l-1 3H2v2h1.5M13 6l2 6H3M13 6V4h5l2 3' />
            </svg>
            <span className='text-xs'>No photo yet</span>
          </div>
        )}

        {/* Price badge overlaid on image */}
        <div className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm
                       rounded-full px-3 py-1 text-sm font-bold text-blue-700
                       shadow-sm'>
          ${car.daily_rate}/day
        </div>
      </div>

      {/* ── Card body ──────────────────────────────────── */}
      <div className='p-4'>
        <h3 className='text-lg font-bold text-gray-800 truncate'>
          {car.brand} {car.model} {car.year}
        </h3>

        {/* Star rating */}
        <div className='flex items-center gap-1 text-amber-500 text-sm mt-1'>
          <Star className='h-4 w-4 fill-current' />
          <span className='font-medium'>{car.average_rating.toFixed(1)}</span>
          <span className='text-gray-400'>({car.total_reviews})</span>
        </div>

        {/* Specs row */}
        <div className='flex items-center gap-3 text-gray-500 text-xs mt-3'>
          {car.location_city && (
            <span className='flex items-center gap-1'>
              <MapPin className='h-3.5 w-3.5' />{car.location_city}
            </span>
          )}
          <span className='flex items-center gap-1'>
            <Users className='h-3.5 w-3.5' />{car.seats} seats
          </span>
          <span className='flex items-center gap-1 capitalize'>
            <Fuel className='h-3.5 w-3.5' />{car.fuel_type}
          </span>
        </div>

        <Link
          href={`/cars/${car.id}`}
          className='mt-4 block w-full text-center bg-blue-700 hover:bg-blue-800
                     text-white font-semibold py-2 rounded-lg transition'
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
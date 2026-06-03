'use client';

import Link from 'next/link';
import { MapPin, Star, Users, Fuel } from 'lucide-react';

interface CarCardProps {
  car: {
    id: number;
    brand: string;
    model: string;
    year: number;
    daily_rate: number;
    location_city: string;
    fuel_type: string;
    seats: number;
    average_rating: number;
    total_reviews: number;
  }
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <div className='bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group'>
      {/* Car Image Placeholder */}
      <div className='h-48 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden'>
        <div className='absolute inset-0 flex items-center justify-center text-blue-400'>
          <span className='text-5xl'>🚗</span>
        </div>
        <div className='absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-sm font-bold text-blue-700'>
          ৳{car.daily_rate}/day
        </div>
      </div>

      {/* Card Body */}
      <div className='p-4'>
        <h3 className='text-lg font-bold text-gray-800'>{car.brand} {car.model} {car.year}</h3>

        <div className='flex items-center gap-1 text-amber-500 text-sm mt-1'>
          <Star className='h-4 w-4 fill-current' />
          <span>{car.average_rating.toFixed(1)}</span>
          <span className='text-gray-400'>({car.total_reviews})</span>
        </div>

        <div className='flex items-center gap-3 text-gray-500 text-sm mt-3'>
          <span className='flex items-center gap-1'><MapPin className='h-4 w-4' />{car.location_city}</span>
          <span className='flex items-center gap-1'><Users className='h-4 w-4' />{car.seats} seats</span>
          <span className='flex items-center gap-1'><Fuel className='h-4 w-4' />{car.fuel_type}</span>
        </div>

        <Link href={`/cars/${car.id}`}
          className='mt-4 block w-full text-center bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition'>
          View Details
        </Link>
      </div>
    </div>
  );
}
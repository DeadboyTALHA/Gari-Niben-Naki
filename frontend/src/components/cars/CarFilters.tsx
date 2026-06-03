'use client';
import { useState } from 'react';
import { VehicleFilters } from '@/types';
import Button from '@/components/ui/Button';

interface FiltersProps {
  onFilterChange: (filters: VehicleFilters) => void;
}

export default function CarFilters({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState<VehicleFilters>({});

  const update = (key: keyof VehicleFilters, value: any) => {
    const next = { ...filters, [key]: value || undefined, page: 1 };
    setFilters(next);
    onFilterChange(next);
  };

  const reset = () => { setFilters({}); onFilterChange({}); };

  return (
    <div className='bg-white rounded-xl shadow-sm p-5 space-y-5 sticky top-20'>
      <div className='flex items-center justify-between'>
        <h3 className='font-bold text-gray-800 text-lg'>Filters</h3>
        <button onClick={reset} className='text-sm text-blue-700 hover:underline'>
          Reset all
        </button>
      </div>

      {/* City */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>City</label>
        <input
          type='text'
          placeholder='e.g. Dhaka'
          value={filters.city ?? ''}
          onChange={e => update('city', e.target.value)}
          className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
        />
      </div>

      {/* Fuel type */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Fuel Type</label>
        <div className='space-y-1'>
          {['petrol','diesel','electric','hybrid'].map(fuel => (
            <label key={fuel} className='flex items-center gap-2 cursor-pointer'>
              <input type='radio' name='fuel' value={fuel}
                checked={filters.fuel_type === fuel}
                onChange={e => update('fuel_type', e.target.value as any)}
                className='text-blue-700'
              />
              <span className='text-sm capitalize text-gray-700'>{fuel}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Transmission</label>
        <div className='space-y-1'>
          {['manual','automatic'].map(t => (
            <label key={t} className='flex items-center gap-2 cursor-pointer'>
              <input type='radio' name='transmission' value={t}
                checked={filters.transmission === t}
                onChange={e => update('transmission', e.target.value as any)}
                className='text-blue-700'
              />
              <span className='text-sm capitalize text-gray-700'>{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Daily Rate (max: ${filters.max_price ?? '∞'})
        </label>
        <input type='range' min={0} max={500} step={10}
          value={filters.max_price ?? 500}
          onChange={e => update('max_price', Number(e.target.value))}
          className='w-full accent-blue-700'
        />
        <div className='flex justify-between text-xs text-gray-400 mt-1'>
          <span>$0</span><span>$500+</span>
        </div>
      </div>

      {/* Seats */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Min. Seats</label>
        <select
          value={filters.seats ?? ''}
          onChange={e => update('seats', e.target.value ? Number(e.target.value) : undefined)}
          className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:ring-2 focus:ring-blue-500 outline-none'
        >
          <option value=''>Any</option>
          {[2,4,5,7].map(n => <option key={n} value={n}>{n}+ seats</option>)}
        </select>
      </div>
    </div>
  );
}
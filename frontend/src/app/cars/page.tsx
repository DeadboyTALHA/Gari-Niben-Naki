'use client';
import { useState, useEffect } from 'react';
import { vehiclesApi } from '@/lib/api';
import CarCard from '@/components/cars/CarCard';
import CarFilters from '@/components/cars/CarFilters';

export default function CarsPage() {
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    setLoading(true);
    vehiclesApi.list({ ...filters, page })
      .then(res => {
        setVehicles(res.data.vehicles);
        setTotal(res.data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, page]);

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold text-gray-800 mb-6'>Available Cars</h1>

      <div className='flex gap-8'>
        {/* Filters Sidebar */}
        <aside className='hidden lg:block w-72 flex-shrink-0'>
          <CarFilters onFilterChange={setFilters} />
        </aside>

        {/* Car Grid */}
        <div className='flex-1'>
          <p className='text-gray-500 mb-4'>{total} cars found</p>
          {loading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
              {[...Array(6)].map((_, i) => (
                <div key={i} className='bg-gray-200 animate-pulse h-64 rounded-xl' />
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
              {vehicles.map((car: any) => <CarCard key={car.id} car={car} />)}
            </div>
          )}

          {/* Pagination */}
          <div className='flex justify-center gap-2 mt-8'>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className='px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50'>Previous</button>
            <span className='px-4 py-2'>Page {page}</span>
            <button onClick={() => setPage(p => p+1)} disabled={vehicles.length < 10}
              className='px-4 py-2 bg-blue-700 text-white rounded-lg disabled:opacity-50'>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
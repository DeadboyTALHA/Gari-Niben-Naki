'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { vehiclesApi } from '@/lib/api';
import CarCard from '@/components/cars/CarCard';
import CarFilters from '@/components/cars/CarFilters';
import { SlidersHorizontal } from 'lucide-react';

// Loading skeleton component
function CardSkeleton() {
  return <div className='bg-gray-200 animate-pulse h-64 rounded-xl' />;
}

// ── Inner component (uses useSearchParams, must be in Suspense) ──
function CarsContent() {
  const searchParams = useSearchParams();

  // Read values passed from the Landing page search form
  const cityFromUrl   = searchParams.get('city')   ?? '';
  const pickupFromUrl = searchParams.get('pickup') ?? '';
  const returnFromUrl = searchParams.get('return') ?? '';

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Initialise filters from URL params so the sidebar shows pre-filled values
  const [filters, setFilters] = useState<any>({
    city:     cityFromUrl || undefined,
    page:     1,
  });

  useEffect(() => {
    setLoading(true);
    vehiclesApi.list({ ...filters, page })
      .then(res => {
        setVehicles(res.data.vehicles || []);
        setTotal(res.data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, page]);

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>

      {/* Page header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>
            {cityFromUrl ? `Cars in ${cityFromUrl}` : 'Available Cars'}
          </h1>
          {!loading && (
            <p className='text-gray-500 mt-1'>
              {total} car{total !== 1 ? 's' : ''} found
              {pickupFromUrl && returnFromUrl && (
                <span className='ml-1 text-blue-700 font-medium'>
                  · {new Date(pickupFromUrl).toLocaleDateString('en-US',
                    {month:'short',day:'numeric'})}
                  {' → '}
                  {new Date(returnFromUrl).toLocaleDateString('en-US',
                    {month:'short',day:'numeric'})}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters(prev => !prev)}
          className='lg:hidden flex items-center gap-2 text-sm border border-gray-300
                     rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50'
        >
          <SlidersHorizontal className='h-4 w-4' />
          Filters
        </button>
      </div>

      <div className='flex gap-8'>

        {/* Sidebar filters */}
        <aside className={`
          lg:block w-72 flex-shrink-0
          ${showFilters ? 'block' : 'hidden'}
        `}>
          <CarFilters
            initialCity={cityFromUrl}
            onFilterChange={(f: any) => { setFilters(f); setPage(1); }}
          />
        </aside>

        {/* Car grid */}
        <div className='flex-1 min-w-0'>
          {loading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
              {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : vehicles.length === 0 ? (
            <div className='text-center py-20 bg-gray-50 rounded-2xl'>
              <p className='text-gray-500 text-lg font-medium'>No cars found</p>
              <p className='text-gray-400 text-sm mt-1'>
                Try a different city or remove some filters.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
              {vehicles.map((car: any) => <CarCard key={car.id} car={car} />)}
            </div>
          )}

          {/* Pagination */}
          {total > 10 && (
            <div className='flex justify-center items-center gap-3 mt-10'>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className='px-4 py-2 bg-white border border-gray-300 rounded-lg
                           text-sm disabled:opacity-50 hover:bg-gray-50 transition'
              >
                Previous
              </button>
              <span className='text-sm text-gray-600'>Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={vehicles.length < 10}
                className='px-4 py-2 bg-blue-700 text-white rounded-lg text-sm
                           disabled:opacity-50 hover:bg-blue-800 transition'
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Outer wrapper — useSearchParams requires Suspense ────
// Next.js requires this pattern whenever you use useSearchParams
export default function CarsPage() {
  return (
    <Suspense fallback={
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <CarsContent />
    </Suspense>
  );
}
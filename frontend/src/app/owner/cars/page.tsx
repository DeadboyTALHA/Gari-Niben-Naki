'use client';
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { api, vehiclesApi } from '@/lib/api';
import { Vehicle } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { PlusCircle, Pencil, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function OwnerCarsPage() {
  useRequireAuth(['owner','both','admin']);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/vehicles/my')
      .then(res => setVehicles(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async (id: number, current: boolean) => {
    try {
      await vehiclesApi.update(id, { is_available: !current });
      setVehicles(prev => prev.map(v =>
        v.id === id ? {...v, is_available: !current} : v
      ));
      toast.success('Availability updated');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this car listing permanently?')) return;
    try {
      await vehiclesApi.delete(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      toast.success('Listing deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-bold text-gray-900'>My Cars</h1>
        <Link href='/owner/cars/new'
          className='flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5
                     rounded-xl hover:bg-blue-800 transition font-medium'>
          <PlusCircle className='h-5 w-5' /> Add Car
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className='text-center py-20 bg-gray-50 rounded-2xl'>
          <p className='text-gray-400 mb-4'>No cars listed yet.</p>
          <Link href='/owner/cars/new' className='text-blue-700 hover:underline'>
            List your first car →
          </Link>
        </div>
      ) : (
        <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-5'>
          {vehicles.map(v => (
            <div key={v.id}
              className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
              <div className='h-40 bg-gradient-to-br from-blue-50 to-blue-100
                             flex items-center justify-center text-5xl'>
                🚗
              </div>
              <div className='p-4'>
                <div className='flex items-start justify-between mb-1'>
                  <h3 className='font-semibold text-gray-800'>
                    {v.brand} {v.model} {v.year}
                  </h3>
                  <StatusBadge status={v.status} />
                </div>
                <p className='text-blue-700 font-bold mb-3'>{formatCurrency(v.daily_rate)}/day</p>

                {/* Availability toggle */}
                <div className='flex items-center gap-2 mb-3'>
                  <button
                    onClick={() => toggleAvailability(v.id, v.is_available)}
                    className={`relative w-10 h-5 rounded-full transition-colors
                      ${v.is_available ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow
                      transition-transform ${v.is_available ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className='text-xs text-gray-500'>
                    {v.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className='flex gap-2'>
                  <Link href={`/cars/${v.id}`}
                    className='flex-1 flex items-center justify-center gap-1 text-xs
                               border border-gray-300 rounded-lg py-1.5 hover:bg-gray-50'>
                    <Eye className='h-3 w-3'/> View
                  </Link>
                  <Link href={`/owner/cars/${v.id}/edit`}
                    className='flex-1 flex items-center justify-center gap-1 text-xs
                               border border-blue-300 text-blue-700 rounded-lg py-1.5 hover:bg-blue-50'>
                    <Pencil className='h-3 w-3'/> Edit
                  </Link>
                  <button onClick={() => handleDelete(v.id)}
                    className='flex items-center justify-center gap-1 text-xs px-3
                               border border-red-300 text-red-600 rounded-lg py-1.5 hover:bg-red-50'>
                    <Trash2 className='h-3 w-3'/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
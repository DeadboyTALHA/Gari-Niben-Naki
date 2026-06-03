'use client';
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Vehicle } from '@/types';
import StatsCard from '@/components/dashboard/StatsCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Car, PlusCircle, DollarSign, Star } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function OwnerDashboard() {
  useRequireAuth(['owner','both','admin']);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/vehicles/my')
      .then(res => setVehicles(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message='Loading dashboard...' />;

  const active   = vehicles.filter(v => v.status === 'active').length;
  const pending  = vehicles.filter(v => v.status === 'pending').length;
  const avgRating = vehicles.length
    ? (vehicles.reduce((s,v) => s + v.average_rating, 0) / vehicles.length).toFixed(1)
    : '0.0';

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Owner Dashboard</h1>
          <p className='text-gray-500 mt-1'>Manage your car listings</p>
        </div>
        <Link href='/owner/cars/new'
          className='flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5
                     rounded-xl hover:bg-blue-800 transition font-medium'>
          <PlusCircle className='h-5 w-5' /> Add New Car
        </Link>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <StatsCard title='Total Listings' value={vehicles.length}
          icon={<Car className='h-5 w-5'/>} color='blue' />
        <StatsCard title='Active Cars'    value={active}
          icon={<Car className='h-5 w-5'/>} color='green' />
        <StatsCard title='Pending Approval' value={pending}
          icon={<Car className='h-5 w-5'/>} color='orange' />
        <StatsCard title='Average Rating'   value={avgRating}
          icon={<Star className='h-5 w-5'/>} color='purple' />
      </div>

      {/* Cars table */}
      <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
        <div className='p-5 border-b flex items-center justify-between'>
          <h2 className='font-bold text-gray-800'>My Listings</h2>
          <Link href='/owner/cars' className='text-blue-700 text-sm hover:underline'>
            Manage all
          </Link>
        </div>
        {vehicles.length === 0 ? (
          <div className='text-center py-12 text-gray-400'>
            <Car className='h-12 w-12 mx-auto mb-3 text-gray-200' />
            <p>No cars listed yet.</p>
            <Link href='/owner/cars/new'
              className='text-blue-700 hover:underline text-sm mt-2 inline-block'>
              List your first car
            </Link>
          </div>
        ) : (
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 text-gray-500 text-xs uppercase tracking-wide'>
              <tr>
                {['Car','Daily Rate','Rating','Status','Actions'].map(h => (
                  <th key={h} className='px-5 py-3 text-left'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50'>
              {vehicles.slice(0,5).map(v => (
                <tr key={v.id} className='hover:bg-gray-50'>
                  <td className='px-5 py-3 font-medium text-gray-800'>
                    {v.brand} {v.model} {v.year}
                  </td>
                  <td className='px-5 py-3'>{formatCurrency(v.daily_rate)}</td>
                  <td className='px-5 py-3'>★ {v.average_rating.toFixed(1)}</td>
                  <td className='px-5 py-3'><StatusBadge status={v.status} /></td>
                  <td className='px-5 py-3'>
                    <Link href={`/owner/cars/${v.id}/edit`}
                      className='text-blue-700 hover:underline'>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
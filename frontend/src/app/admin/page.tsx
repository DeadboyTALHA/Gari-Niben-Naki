'use client';
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import StatsCard from '@/components/dashboard/StatsCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { Users, Car, BookOpen, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = ['Overview','Pending Cars','Users','Disputes'];

export default function AdminDashboard() {
  useRequireAuth(['admin']);
  const [tab, setTab]       = useState(0);
  const [stats, setStats]   = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [users, setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/vehicles?status=pending&page_size=20'),
      api.get('/admin/users'),
    ]).then(([statsRes, pendingRes, usersRes]) => {
      setStats(statsRes.data);
      setPending(pendingRes.data.vehicles ?? []);
      setUsers(usersRes.data.users ?? []);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const approveVehicle = async (id: number) => {
    try {
      await api.patch(`/admin/vehicles/${id}/approve`);
      setPending(p => p.filter(v => v.id !== id));
      toast.success('Vehicle approved');
    } catch { toast.error('Failed'); }
  };

  const rejectVehicle = async (id: number) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try {
      await api.patch(`/admin/vehicles/${id}/reject?reason=${encodeURIComponent(reason)}`);
      setPending(p => p.filter(v => v.id !== id));
      toast.success('Vehicle rejected');
    } catch { toast.error('Failed'); }
  };

  const suspendUser = async (id: number) => {
    if (!confirm('Suspend this user?')) return;
    try {
      await api.patch(`/admin/users/${id}/suspend`);
      setUsers(u => u.map(user => user.id === id ? {...user, is_active:false} : user));
      toast.success('User suspended');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <LoadingSpinner message='Loading admin panel...' />;

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold text-gray-900 mb-6'>Admin Dashboard</h1>

      {/* Stats */}
      {stats && (
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <StatsCard title='Total Users'      value={stats.total_users}
            icon={<Users className='h-5 w-5'/>} color='blue' />
          <StatsCard title='Total Vehicles'   value={stats.total_vehicles}
            icon={<Car className='h-5 w-5'/>}   color='green' />
          <StatsCard title='Pending Approvals' value={stats.pending_approvals}
            icon={<AlertCircle className='h-5 w-5'/>} color='orange' />
          <StatsCard title='Active Bookings'  value={stats.active_bookings}
            icon={<BookOpen className='h-5 w-5'/>} color='purple' />
        </div>
      )}

      {/* Tabs */}
      <div className='flex border-b mb-6 overflow-x-auto'>
        {TABS.map((t,i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition
              ${tab===i ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >{t}</button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 0 && (
        <div className='bg-gray-50 rounded-xl p-6 text-gray-500 text-center'>
          <p>Summary charts and recent activity will appear here.</p>
          <p className='text-sm mt-1'>
            Connect Recharts to your /admin/stats endpoint for graphs.
          </p>
        </div>
      )}

      {/* Pending Cars tab */}
      {tab === 1 && (
        <div>
          {pending.length === 0 ? (
            <p className='text-gray-400 text-center py-12'>No pending approvals</p>
          ) : (
            <div className='space-y-3'>
              {pending.map(v => (
                <div key={v.id}
                  className='bg-white rounded-xl p-4 flex items-center justify-between shadow-sm'>
                  <div>
                    <p className='font-semibold'>{v.brand} {v.model} {v.year}</p>
                    <p className='text-sm text-gray-500'>{v.location_city} • ${v.daily_rate}/day</p>
                  </div>
                  <div className='flex gap-2'>
                    <Button size='sm' variant='primary' onClick={() => approveVehicle(v.id)}>
                      Approve
                    </Button>
                    <Button size='sm' variant='danger' onClick={() => rejectVehicle(v.id)}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users tab */}
      {tab === 2 && (
        <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 text-gray-500 text-xs uppercase'>
              <tr>
                {['Name','Email','Role','Status','Actions'].map(h => (
                  <th key={h} className='px-5 py-3 text-left'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50'>
              {users.map((u: any) => (
                <tr key={u.id} className='hover:bg-gray-50'>
                  <td className='px-5 py-3 font-medium'>{u.full_name}</td>
                  <td className='px-5 py-3 text-gray-500'>{u.email}</td>
                  <td className='px-5 py-3 capitalize'>{u.role}</td>
                  <td className='px-5 py-3'>
                    <StatusBadge status={u.is_active ? 'active' : 'cancelled'} />
                  </td>
                  <td className='px-5 py-3'>
                    {u.is_active && (
                      <button onClick={() => suspendUser(u.id)}
                        className='text-red-600 text-xs hover:underline'>Suspend</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Disputes tab */}
      {tab === 3 && (
        <div className='bg-gray-50 rounded-xl p-6 text-center text-gray-400'>
          <p>Disputes management view.</p>
          <p className='text-sm mt-1'>Fetch from /disputes and render here.</p>
        </div>
      )}
    </div>
  );
}
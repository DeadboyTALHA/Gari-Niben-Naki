'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Car, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const dashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'owner') return '/owner/dashboard';
    return '/dashboard';
  };

  return (
    <nav className='bg-white shadow-md sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>

          {/* Logo */}
          <Link href='/' className='flex items-center gap-2 text-blue-700 font-bold text-xl'>
            <Car className='h-7 w-7' />
            Gari Niben Naki
          </Link>

          {/* Desktop Links */}
          <div className='hidden md:flex items-center gap-6'>
            <Link href='/cars' className='text-gray-600 hover:text-blue-700 transition'>Browse Cars</Link>
            {isAuthenticated ? (
              <>
                <Link href={dashboardLink()} className='text-gray-600 hover:text-blue-700'>
                  <User className='inline h-4 w-4 mr-1' />Dashboard
                </Link>
                {isAuthenticated && (user?.role === 'owner' || user?.role === 'both') && (
                  <Link href='/owner/bookings'
                    className='text-gray-600 hover:text-blue-700 transition text-sm'>
                    Bookings
                  </Link>
                )}
                <button onClick={handleLogout} className='text-gray-600 hover:text-red-600 flex items-center gap-1'>
                  <LogOut className='h-4 w-4' /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href='/login' className='text-gray-600 hover:text-blue-700'>Login</Link>
                <Link href='/register' className='bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition'>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className='md:hidden' onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className='md:hidden px-4 pb-4 flex flex-col gap-3 bg-white border-t'>
          <Link href='/cars' className='text-gray-700 py-2' onClick={() => setMenuOpen(false)}>Browse Cars</Link>
          {isAuthenticated ? (
            <>
              <Link href={dashboardLink()} className='text-gray-700 py-2' onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className='text-red-600 py-2 text-left'>Logout</button>
            </>
          ) : (
            <>
              <Link href='/login' className='text-gray-700 py-2' onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href='/register' className='text-gray-700 py-2' onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
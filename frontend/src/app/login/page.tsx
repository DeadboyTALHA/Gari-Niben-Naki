'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { access_token, user_id, role } = res.data;

      // Fetch full user profile
      setAuth({ id: user_id, email, full_name: '', role }, access_token);
      toast.success('Welcome back!');

      // Redirect based on role
      if (role === 'admin') router.push('/admin');
      else if (role === 'owner') router.push('/owner/dashboard');
      else router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='bg-white rounded-2xl shadow-lg p-8 w-full max-w-md'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Welcome back</h1>
        <p className='text-gray-500 mb-8'>Sign in to your account</p>

        <form onSubmit={handleLogin} className='space-y-5'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
              placeholder='you@example.com'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
              placeholder='Your password'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className='text-center text-gray-500 mt-6'>
          Do not have an account?{' '}
          <Link href='/register' className='text-blue-700 hover:underline font-medium'>Create one</Link>
        </p>
      </div>
    </div>
  );
}
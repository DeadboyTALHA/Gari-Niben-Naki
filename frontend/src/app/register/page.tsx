'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type Role = 'customer' | 'owner' | 'both';

export default function RegisterPage() {
  const router    = useRouter();
  const { setAuth } = useAuthStore();
  const [step, setStep]       = useState(1);   // Step 1 = form, Step 2 = role
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    full_name: '', email: '', phone: '', password: '', confirm: '',
  });
  const [role, setRole]       = useState<Role>('customer');

  const updateForm = (key: string, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match'); return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters'); return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({
        full_name: form.full_name,
        email:     form.email,
        phone:     form.phone,
        password:  form.password,
        role,
      });
      const { access_token, user_id } = res.data;
      setAuth({ id: user_id, full_name: form.full_name, email: form.email, role } as any, access_token);
      toast.success('Account created! Welcome aboard.');
      router.push(role === 'owner' ? '/owner/dashboard' : '/dashboard');
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12'>
      <div className='bg-white rounded-2xl shadow-lg p-8 w-full max-w-md'>
        <div className='flex gap-2 mb-6'>
          {[1,2].map(s => (
            <div key={s}
              className={`h-1 flex-1 rounded-full transition-colors
                ${step >= s ? 'bg-blue-700' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className='text-2xl font-bold text-gray-800 mb-1'>Create Account</h1>
            <p className='text-gray-500 mb-6'>Fill in your details to get started</p>
            <div className='space-y-4'>
              <Input label='Full Name' required value={form.full_name}
                onChange={e => updateForm('full_name', e.target.value)} />
              <Input label='Email' type='email' required value={form.email}
                onChange={e => updateForm('email', e.target.value)} />
              <Input label='Phone Number' value={form.phone}
                onChange={e => updateForm('phone', e.target.value)} />
              <Input label='Password' type='password' required value={form.password}
                onChange={e => updateForm('password', e.target.value)}
                hint='Minimum 8 characters' />
              <Input label='Confirm Password' type='password' required value={form.confirm}
                onChange={e => updateForm('confirm', e.target.value)} />
              <Button fullWidth onClick={() => setStep(2)}
                disabled={!form.full_name || !form.email || !form.password}>
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className='text-2xl font-bold text-gray-800 mb-1'>How will you use the app?</h1>
            <p className='text-gray-500 mb-6'>You can change this later</p>
            <div className='space-y-3 mb-6'>
              {([
                ['customer', 'Rent Cars',        'I want to rent cars from owners'],
                ['owner',    'List My Car',       'I want to list my car for rent'],
                ['both',     'Both',              'I want to rent cars AND list my own'],
              ] as [Role, string, string][]).map(([val, label, desc]) => (
                <label key={val}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition
                    ${role === val ? 'border-blue-700 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input type='radio' className='mt-1 text-blue-700' name='role'
                    checked={role === val} onChange={() => setRole(val)} />
                  <div>
                    <p className='font-semibold text-gray-800'>{label}</p>
                    <p className='text-sm text-gray-500'>{desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className='flex gap-3'>
              <Button variant='secondary' onClick={() => setStep(1)}>Back</Button>
              <Button fullWidth loading={loading} onClick={handleSubmit}>
                Create Account
              </Button>
            </div>
          </>
        )}

        <p className='text-center text-gray-500 mt-6 text-sm'>
          Already have an account?{' '}
          <Link href='/login' className='text-blue-700 hover:underline font-medium'>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
'use client';
import { useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const TABS = ['Personal Info', 'Documents', 'Change Password'];

export default function ProfilePage() {
  const { user } = useRequireAuth();
  const [tab, setTab]         = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ full_name: user?.full_name ?? '', phone: user?.phone ?? '' });
  const [pwForm, setPwForm]   = useState({ current_password:'', new_password:'', confirm:'' });

  const saveProfile = async () => {
    setLoading(true);
    try {
      await api.put('/users/profile', { full_name: form.full_name, phone: form.phone });
      toast.success('Profile updated');
    } catch { toast.error('Failed to update'); }
    finally { setLoading(false); }
  };

  const changePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('Passwords do not match'); return;
    }
    setLoading(true);
    try {
      await api.post('/users/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      toast.success('Password changed');
      setPwForm({ current_password:'', new_password:'', confirm:'' });
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className='max-w-2xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold text-gray-900 mb-6'>My Profile</h1>

      {/* Tab bar */}
      <div className='flex border-b mb-6'>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition
              ${tab===i ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <div className='space-y-4'>
          <Input label='Full Name' value={form.full_name}
            onChange={e => setForm(p => ({...p, full_name: e.target.value}))} />
          <Input label='Email' value={user?.email ?? ''} disabled
            hint='Email cannot be changed' />
          <Input label='Phone' value={form.phone}
            onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
          <Button loading={loading} onClick={saveProfile}>Save Changes</Button>
        </div>
      )}

      {tab === 1 && (
        <div className='space-y-4'>
          <p className='text-gray-600 text-sm'>
            Upload your driving license to verify your account.
            Accepted formats: JPEG, PNG, PDF.
          </p>
          <div className='border-2 border-dashed border-gray-300 rounded-xl p-8 text-center'>
            <input type='file' accept='image/*,.pdf' className='hidden' id='doc-upload'
              onChange={async e => {
                if (!e.target.files?.[0]) return;
                const fd = new FormData();
                fd.append('file', e.target.files[0]);
                fd.append('document_type', 'driving_license');
                try {
                  await api.post('/documents/upload', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  toast.success('Document uploaded');
                } catch { toast.error('Upload failed'); }
              }}
            />
            <label htmlFor='doc-upload'
              className='cursor-pointer text-blue-700 hover:underline font-medium'>
              Click to upload driving license
            </label>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className='space-y-4'>
          <Input label='Current Password' type='password'
            value={pwForm.current_password}
            onChange={e => setPwForm(p => ({...p, current_password: e.target.value}))} />
          <Input label='New Password' type='password'
            value={pwForm.new_password}
            onChange={e => setPwForm(p => ({...p, new_password: e.target.value}))} />
          <Input label='Confirm New Password' type='password'
            value={pwForm.confirm}
            onChange={e => setPwForm(p => ({...p, confirm: e.target.value}))} />
          <Button loading={loading} onClick={changePassword}>Change Password</Button>
        </div>
      )}
    </div>
  );
}
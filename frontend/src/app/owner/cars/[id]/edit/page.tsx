'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';
import { vehiclesApi, vehicleImagesApi } from '@/lib/api';
import { Vehicle } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = ['Details', 'Photos'];

export default function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  useRequireAuth(['owner', 'both', 'admin']);
  const router = useRouter();

  const [tab, setTab]         = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [images, setImages]   = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    brand: '', model: '', year: 0, color: '',
    license_plate: '', fuel_type: 'petrol', transmission: 'manual',
    seats: 5, doors: 4, daily_rate: 0, security_deposit: 0,
    location_city: '', location_address: '', description: '',
    is_available: true,
  });

  // Load existing vehicle data on page mount
  useEffect(() => {
    Promise.all([
      vehiclesApi.get(Number(id)),
      vehicleImagesApi.list(Number(id)),
    ])
      .then(([vRes, imgRes]) => {
        const v: Vehicle = vRes.data;
        setForm({
          brand:            v.brand,
          model:            v.model,
          year:             v.year,
          color:            v.color ?? '',
          license_plate:    v.license_plate,
          fuel_type:        v.fuel_type,
          transmission:     v.transmission,
          seats:            v.seats,
          doors:            v.doors,
          daily_rate:       v.daily_rate,
          security_deposit: v.security_deposit,
          location_city:    v.location_city ?? '',
          location_address: v.location_address ?? '',
          description:      v.description ?? '',
          is_available:     v.is_available,
        });
        setImages(imgRes.data);
      })
      .catch(() => toast.error('Could not load vehicle'))
      .finally(() => setLoading(false));
  }, [id]);

  const update = (key: string, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  // Save the updated form fields
  const handleSave = async () => {
    setSaving(true);
    try {
      await vehiclesApi.update(Number(id), form);
      toast.success('Changes saved!');
      router.push('/owner/cars');
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Upload new photos
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const res = await vehicleImagesApi.upload(Number(id), files);
      setImages(prev => [...prev, ...res.data.images]);
      toast.success(`${files.length} photo(s) uploaded`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = ''; // reset file input so same file can be re-selected
    }
  };

  // Delete a photo
  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await vehicleImagesApi.delete(Number(id), imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Photo deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  // Set a photo as the primary thumbnail
  const handleSetPrimary = async (imageId: number) => {
    try {
      await vehicleImagesApi.setPrimary(Number(id), imageId);
      setImages(prev =>
        prev.map(img => ({ ...img, is_primary: img.id === imageId })),
      );
      toast.success('Primary photo updated');
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return <LoadingSpinner message='Loading car details...' />;

  return (
    <div className='max-w-2xl mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-bold text-gray-900'>Edit Car</h1>
        <button
          onClick={() => router.push('/owner/cars')}
          className='text-sm text-gray-500 hover:text-gray-700'
        >
          ← Back to my cars
        </button>
      </div>

      {/* Tab bar */}
      <div className='flex border-b mb-6'>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition
              ${tab === i
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'}
            `}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab 0: Details ─────────────────────────────── */}
      {tab === 0 && (
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <Input label='Brand' value={form.brand}
              onChange={e => update('brand', e.target.value)} />
            <Input label='Model' value={form.model}
              onChange={e => update('model', e.target.value)} />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <Input label='Year' type='number' value={String(form.year)}
              onChange={e => update('year', Number(e.target.value))} />
            <Input label='Color' value={form.color}
              onChange={e => update('color', e.target.value)} />
          </div>
          <Input label='License Plate' value={form.license_plate}
            onChange={e => update('license_plate', e.target.value)} />
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Fuel Type</label>
              <select value={form.fuel_type}
                onChange={e => update('fuel_type', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                           focus:ring-2 focus:ring-blue-500 outline-none'>
                {['petrol','diesel','electric','hybrid'].map(f => (
                  <option key={f} value={f} className='capitalize'>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Transmission</label>
              <select value={form.transmission}
                onChange={e => update('transmission', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                           focus:ring-2 focus:ring-blue-500 outline-none'>
                <option value='manual'>Manual</option>
                <option value='automatic'>Automatic</option>
              </select>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <Input label='Seats' type='number' value={String(form.seats)}
              onChange={e => update('seats', Number(e.target.value))} />
            <Input label='Doors' type='number' value={String(form.doors)}
              onChange={e => update('doors', Number(e.target.value))} />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <Input label='Daily Rate ($)' type='number' value={String(form.daily_rate)}
              onChange={e => update('daily_rate', Number(e.target.value))} />
            <Input label='Security Deposit ($)' type='number'
              value={String(form.security_deposit)}
              onChange={e => update('security_deposit', Number(e.target.value))} />
          </div>
          <Input label='City' value={form.location_city}
            onChange={e => update('location_city', e.target.value)} />
          <Input label='Full Address' value={form.location_address}
            onChange={e => update('location_address', e.target.value)} />
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={4}
              className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:ring-2 focus:ring-blue-500 outline-none resize-none'
              placeholder='Describe your car, any special features, pickup instructions...'
            />
          </div>
          {/* Availability toggle */}
          <label className='flex items-center gap-3 cursor-pointer'>
            <button
              type='button'
              onClick={() => update('is_available', !form.is_available)}
              className={`relative w-11 h-6 rounded-full transition-colors
                ${form.is_available ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
                transition-transform
                ${form.is_available ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <span className='text-sm font-medium text-gray-700'>
              {form.is_available ? 'Available for booking' : 'Not available'}
            </span>
          </label>

          <div className='flex gap-3 pt-2'>
            <Button variant='secondary' onClick={() => router.push('/owner/cars')}>
              Cancel
            </Button>
            <Button fullWidth loading={saving} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* ── Tab 1: Photos ──────────────────────────────── */}
      {tab === 1 && (
        <div className='space-y-4'>
          {/* Upload button */}
          <div className='border-2 border-dashed border-gray-300 rounded-xl p-6 text-center'>
            <input
              id='photo-upload'
              type='file'
              accept='image/jpeg,image/png,image/webp'
              multiple
              className='hidden'
              onChange={handleImageUpload}
            />
            <label
              htmlFor='photo-upload'
              className='cursor-pointer text-blue-700 hover:underline font-medium text-sm'
            >
              {uploading ? 'Uploading...' : 'Click to upload photos (JPEG, PNG, WebP)'}
            </label>
            <p className='text-xs text-gray-400 mt-1'>Up to 10 photos total</p>
          </div>

          {/* Existing images grid */}
          {images.length === 0 ? (
            <p className='text-center text-gray-400 text-sm py-8'>
              No photos uploaded yet.
            </p>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
              {images.map((img: any) => (
                <div key={img.id} className='relative group rounded-xl overflow-hidden
                                            border-2 border-transparent
                                            hover:border-blue-300 transition'>
                  <img
                    src={img.image_url}
                    alt='Car photo'
                    className='w-full h-32 object-cover'
                  />
                  {/* Primary badge */}
                  {img.is_primary && (
                    <div className='absolute top-1 left-1 bg-blue-700 text-white
                                   text-xs px-2 py-0.5 rounded-full flex items-center gap-1'>
                      <Star className='h-3 w-3 fill-current' /> Primary
                    </div>
                  )}
                  {/* Action buttons — shown on hover */}
                  <div className='absolute inset-0 bg-black/40 opacity-0
                                 group-hover:opacity-100 transition flex items-center
                                 justify-center gap-2'>
                    {!img.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(img.id)}
                        className='bg-blue-700 text-white text-xs px-2 py-1 rounded-lg'
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className='bg-red-600 text-white p-1.5 rounded-lg'
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
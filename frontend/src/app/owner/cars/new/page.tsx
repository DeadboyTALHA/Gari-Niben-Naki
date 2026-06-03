'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';
import { vehiclesApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const STEPS = ['Basic Info','Specifications','Pricing','Photos'];

export default function AddCarPage() {
  useRequireAuth(['owner','both','admin']);
  const router = useRouter();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    brand:'', model:'', year: new Date().getFullYear(), color:'',
    license_plate:'', location_city:'', location_address:'',
    fuel_type:'petrol', transmission:'manual', seats:5, doors:4,
    daily_rate:0, security_deposit:0, description:'',
  });

  const update = (key: string, val: any) => setForm(p => ({...p, [key]: val}));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await vehiclesApi.create(form);
      toast.success('Car listed! Awaiting admin approval.');
      router.push('/owner/cars');
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to list car');
    } finally { setLoading(false); }
  };

  return (
    <div className='max-w-2xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold text-gray-900 mb-2'>List a New Car</h1>

      {/* Step progress bar */}
      <div className='flex gap-2 mb-8'>
        {STEPS.map((s, i) => (
          <div key={s} className='flex-1'>
            <div className={`h-1.5 rounded-full transition-colors
              ${i <= step ? 'bg-blue-700' : 'bg-gray-200'}`} />
            <p className={`text-xs mt-1 ${i===step ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
              {s}
            </p>
          </div>
        ))}
      </div>

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <Input label='Brand' required value={form.brand}
              onChange={e => update('brand', e.target.value)} placeholder='e.g. Toyota' />
            <Input label='Model' required value={form.model}
              onChange={e => update('model', e.target.value)} placeholder='e.g. Corolla' />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <Input label='Year' type='number' value={String(form.year)}
              onChange={e => update('year', Number(e.target.value))} />
            <Input label='Color' value={form.color}
              onChange={e => update('color', e.target.value)} placeholder='e.g. White' />
          </div>
          <Input label='License Plate' required value={form.license_plate}
            onChange={e => update('license_plate', e.target.value)} placeholder='e.g. DHA-KA 1234' />
          <Input label='City' value={form.location_city}
            onChange={e => update('location_city', e.target.value)} placeholder='e.g. Dhaka' />
          <Input label='Full Address' value={form.location_address}
            onChange={e => update('location_address', e.target.value)} />
          <Button onClick={() => setStep(1)}
            disabled={!form.brand || !form.model || !form.license_plate}>
            Next: Specifications
          </Button>
        </div>
      )}

      {/* Step 1: Specifications */}
      {step === 1 && (
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Fuel Type</label>
            <div className='grid grid-cols-2 gap-2'>
              {['petrol','diesel','electric','hybrid'].map(f => (
                <label key={f}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer
                    ${form.fuel_type===f ? 'border-blue-700 bg-blue-50' : 'border-gray-200'}`}
                >
                  <input type='radio' name='fuel' value={f}
                    checked={form.fuel_type===f}
                    onChange={() => update('fuel_type',f)} />
                  <span className='text-sm capitalize'>{f}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Transmission</label>
            <div className='grid grid-cols-2 gap-2'>
              {['manual','automatic'].map(t => (
                <label key={t}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer
                    ${form.transmission===t ? 'border-blue-700 bg-blue-50' : 'border-gray-200'}`}
                >
                  <input type='radio' name='transmission' value={t}
                    checked={form.transmission===t}
                    onChange={() => update('transmission',t)} />
                  <span className='text-sm capitalize'>{t}</span>
                </label>
              ))}
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <Input label='Seats' type='number' value={String(form.seats)}
              onChange={e => update('seats', Number(e.target.value))} />
            <Input label='Doors' type='number' value={String(form.doors)}
              onChange={e => update('doors', Number(e.target.value))} />
          </div>
          <div className='flex gap-3'>
            <Button variant='secondary' onClick={() => setStep(0)}>Back</Button>
            <Button onClick={() => setStep(2)}>Next: Pricing</Button>
          </div>
        </div>
      )}

      {/* Step 2: Pricing */}
      {step === 2 && (
        <div className='space-y-4'>
          <Input label='Daily Rate ($)' type='number' required value={String(form.daily_rate)}
            onChange={e => update('daily_rate', Number(e.target.value))}
            hint='How much you charge per day' />
          <Input label='Security Deposit ($)' type='number' value={String(form.security_deposit)}
            onChange={e => update('security_deposit', Number(e.target.value))}
            hint='Refunded after return (can be 0)' />
          <div className='flex gap-3'>
            <Button variant='secondary' onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} disabled={!form.daily_rate}>
              Next: Photos
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Photos + Submit */}
      {step === 3 && (
        <div className='space-y-4'>
          <div className='border-2 border-dashed border-gray-300 rounded-xl p-8 text-center'>
            <p className='text-gray-400 text-sm'>Photo upload coming soon.</p>
            <p className='text-gray-400 text-xs mt-1'>
              You can add photos after listing by editing the car.
            </p>
          </div>
          <div className='flex gap-3'>
            <Button variant='secondary' onClick={() => setStep(2)}>Back</Button>
            <Button fullWidth loading={loading} onClick={handleSubmit}>
              Submit for Approval
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
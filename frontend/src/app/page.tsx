'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Shield, Star, ArrowRight, Clock, Search, MapPin, Calendar } from 'lucide-react';

// ── SearchForm component ──────────────────────────────────
function SearchForm() {
  const router = useRouter();
  const [city,       setCity]       = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Build query params — only include non-empty values
    const params = new URLSearchParams();
    if (city.trim())  params.set('city',   city.trim());
    if (pickupDate)   params.set('pickup', pickupDate);
    if (returnDate)   params.set('return', returnDate);

    // Navigate to /cars with the search params
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className='bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2
                 max-w-3xl mx-auto'
    >
      {/* City field */}
      <div className='flex items-center gap-2 flex-1 px-4 py-2 rounded-xl
                     bg-gray-50 border border-gray-200'>
        <MapPin className='h-4 w-4 text-gray-400 flex-shrink-0' />
        <input
          type='text'
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder='City (e.g. Dhaka)'
          className='bg-transparent text-gray-800 text-sm w-full
                     placeholder-gray-400 focus:outline-none'
        />
      </div>

      {/* Pickup date */}
      <div className='flex items-center gap-2 flex-1 px-4 py-2 rounded-xl
                     bg-gray-50 border border-gray-200'>
        <Calendar className='h-4 w-4 text-gray-400 flex-shrink-0' />
        <input
          type='date'
          value={pickupDate}
          min={today}
          onChange={e => setPickupDate(e.target.value)}
          className='bg-transparent text-gray-800 text-sm w-full
                     focus:outline-none cursor-pointer'
        />
      </div>

      {/* Return date */}
      <div className='flex items-center gap-2 flex-1 px-4 py-2 rounded-xl
                     bg-gray-50 border border-gray-200'>
        <Calendar className='h-4 w-4 text-gray-400 flex-shrink-0' />
        <input
          type='date'
          value={returnDate}
          min={pickupDate || today}
          onChange={e => setReturnDate(e.target.value)}
          className='bg-transparent text-gray-800 text-sm w-full
                     focus:outline-none cursor-pointer'
        />
      </div>

      {/* Search button */}
      <button
        type='submit'
        className='bg-blue-700 hover:bg-blue-800 text-white font-semibold
                   px-6 py-3 rounded-xl transition flex items-center gap-2
                   justify-center whitespace-nowrap'
      >
        <Search className='h-4 w-4' />
        Search
      </button>
    </form>
  );
}

export default function HomePage() {
  return (
    <div>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className='bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900
                   text-white py-24 px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <h1 className='text-4xl md:text-6xl font-bold mb-4 leading-tight'>
            Find Your Perfect Ride
          </h1>
          <p className='text-xl text-blue-100 mb-10 max-w-2xl mx-auto'>
            Rent cars from trusted owners near you.
            Simple, affordable, and hassle-free.
          </p>

          {/* ── Search form ──────────────────────────────── */}
          <SearchForm />

          {/* ── Secondary CTA ────────────────────────────── */}
          <p className='mt-6 text-blue-200 text-sm'>
            Or{' '}
            <Link href='/cars'
              className='text-white underline underline-offset-2 hover:text-blue-100'>
              browse all available cars
            </Link>
          </p>
        </div>
      </section>


      {/* ── How It Works ───────────────────────────────────── */}
      <section id='how-it-works' className='py-20 px-4 bg-gray-50'>
        <div className='max-w-5xl mx-auto'>
          <h2 className='text-3xl font-bold text-center text-gray-800 mb-12'>
            How It Works
          </h2>
          <div className='grid md:grid-cols-3 gap-8'>
            {[
              { step:'01', icon:<MapPin className='h-8 w-8'/>, title:'Search',
                desc:'Filter by city, dates, car type, and price to find the perfect match.' },
              { step:'02', icon:<Car className='h-8 w-8'/>, title:'Book',
                desc:'Select dates, choose insurance, and pay securely in minutes.' },
              { step:'03', icon:<ArrowRight className='h-8 w-8'/>, title:'Drive',
                desc:'Pick up the car and enjoy your ride. Return it when done.' },
            ].map(item => (
              <div key={item.step} className='text-center'>
                <div className='w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl
                               flex items-center justify-center mx-auto mb-4'>
                  {item.icon}
                </div>
                <span className='text-xs font-bold text-blue-700 tracking-widest'>STEP {item.step}</span>
                <h3 className='text-xl font-bold text-gray-800 my-2'>{item.title}</h3>
                <p className='text-gray-500'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us ─────────────────────────────────────────── */}
      <section className='py-20 px-4'>
        <div className='max-w-5xl mx-auto'>
          <h2 className='text-3xl font-bold text-center text-gray-800 mb-12'>
            Why Choose Us
          </h2>
          <div className='grid md:grid-cols-3 gap-8'>
            {[
              { icon:<Shield className='h-6 w-6'/>,
                title:'Verified Cars',
                desc:'Every car is reviewed and approved by our team before listing.' },
              { icon:<Star className='h-6 w-6'/>,
                title:'Trusted Owners',
                desc:'All owners are KYC-verified with real ratings from renters.' },
              { icon:<Clock className='h-6 w-6'/>,
                title:'24/7 Support',
                desc:'Our support team is available any time you need help.' },
            ].map(item => (
              <div key={item.title}
                className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center'>
                <div className='w-12 h-12 bg-blue-100 text-blue-700 rounded-xl
                               flex items-center justify-center mx-auto mb-4'>
                  {item.icon}
                </div>
                <h3 className='font-bold text-gray-800 mb-2'>{item.title}</h3>
                <p className='text-gray-500 text-sm'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className='bg-blue-700 text-white py-16 px-4 text-center'>
        <h2 className='text-3xl font-bold mb-4'>Ready to Hit the Road?</h2>
        <p className='text-blue-100 mb-8'>Join thousands of happy renters across Bangladesh.</p>
        <Link href='/cars'
          className='bg-white text-blue-700 font-bold px-8 py-4 rounded-xl
                     hover:bg-blue-50 transition inline-block'>
          Find a Car Now
        </Link>
      </section>
    </div>
  );
}

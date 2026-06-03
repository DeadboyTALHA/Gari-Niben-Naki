import Link from 'next/link';
import { Car, Shield, Star, ArrowRight, MapPin, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className='bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white py-24 px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <h1 className='text-4xl md:text-6xl font-bold mb-4 leading-tight'>
            Find Your Perfect Ride
          </h1>
          <p className='text-xl text-blue-100 mb-8 max-w-2xl mx-auto'>
            Rent cars from trusted owners near you.
            Simple, affordable, and hassle-free.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href='/cars'
              className='bg-white text-blue-700 font-bold px-8 py-4 rounded-xl
                         hover:bg-blue-50 transition inline-flex items-center gap-2'>
              Browse Cars <ArrowRight className='h-5 w-5' />
            </Link>
            <Link href='/register'
              className='border-2 border-white text-white font-bold px-8 py-4 rounded-xl
                         hover:bg-white/10 transition'>
              List Your Car
            </Link>
          </div>
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

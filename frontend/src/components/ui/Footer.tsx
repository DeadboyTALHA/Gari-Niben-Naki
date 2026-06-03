import Link from 'next/link';
import { Car } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='bg-gray-900 text-gray-300 mt-20'>
      <div className='max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8'>

        {/* Brand */}
        <div className='col-span-1'>
          <div className='flex items-center gap-2 text-white font-bold text-xl mb-3'>
            <Car className='h-6 w-6 text-blue-400' />
            Gari Niben Naki
          </div>
          <p className='text-sm text-gray-400 leading-relaxed'>
            Your trusted platform for finding and renting cars across Bangladesh.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className='text-white font-semibold mb-3'>Quick Links</h4>
          <ul className='space-y-2 text-sm'>
            {[
              ['Browse Cars', '/cars'],
              ['How It Works', '/#how-it-works'],
              ['List Your Car', '/register'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className='hover:text-blue-400 transition'>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className='text-white font-semibold mb-3'>Account</h4>
          <ul className='space-y-2 text-sm'>
            {[
              ['Sign In',   '/login'],
              ['Register',  '/register'],
              ['Dashboard', '/dashboard'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className='hover:text-blue-400 transition'>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className='text-white font-semibold mb-3'>Contact</h4>
          <ul className='space-y-2 text-sm text-gray-400'>
            <li>Dhaka, Bangladesh</li>
            <li>support@garinibennaki.com</li>
          </ul>
        </div>
      </div>

      <div className='border-t border-gray-800 py-4 text-center text-xs text-gray-500'>
        © {new Date().getFullYear()} Gari Niben Naki. All rights reserved.
      </div>
    </footer>
  );
}